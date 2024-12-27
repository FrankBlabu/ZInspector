import argparse
import grpc
import h5py
import json
import logging
import os
import sys
import trimesh
import zinspector_pb2
import zinspector_pb2_grpc

from concurrent import futures

from elements.mesh import Mesh
from elements.project import Project, Mesh
from elements.object import Object, ObjectIdDatabase

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s', stream=sys.stdout)


class Configuration:
    '''
    Constants user for configuration
    '''
    MESH_DATA_CHUNK_SIZE = 1024 * 1024 * 2  # Default limit for grpc is 4MB
    MESH_ENCODING = 'glb'


class Root (Object):
    '''
    The root object of the project database
    '''

    def __init__(self):
        super().__init__('Root')
        self.projects = []

    def get_children(self):
        return self.projects

    def add_project(self, project):
        self.projects.append(project)

    def __load__(self, parent: h5py.Group):
        super().__load__(parent)

    def __save__(self, parent: h5py.Group):
        super().__save__(parent)


class ZInspector(zinspector_pb2_grpc.ZInspectorServicer):
    '''
    Implementation of the ZInspector service
    '''

    # Top level object
    root = Root()

    def GetObjectTree(self, request, context):
        '''
        Get the object tree for a project in a JSON format
        beginning at a given object
        '''

        log.info(f'GetObjectTree: {request.id}')

        # Local function which recursively builds the tree
        def build_tree(obj):
            objs = []
            for child in obj.get_children():
                objs.append({
                    'id': child.get_id(),
                    'label': child.get_name(),
                    'type': child.__type__(),
                    'children': build_tree(child)
                })

            return objs

        tree = {}

        try:
            if request.id:
                tree = build_tree(ObjectIdDatabase.get(request.id))
            else:
                tree = build_tree(ZInspector.root)

        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.JSONResponse(json=json.dumps(tree))

    def GetObjects(self, request, context):
        '''
        Get a list of objects in the project database
        '''

        log.info(f'GetObjects, parent={request.id}')

        ids = []

        try:

            if request.id:
                parent = ObjectIdDatabase.get(request.id)
            else:
                parent = ZInspector.root

            ids = [child.get_id() for child in parent.get_children()]

        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

        log.debug(f'Result: {ids}')

        return zinspector_pb2.IdResponse(ids=ids)

    def GetName(self, request, context):
        '''
        Get the name of an object
        '''

        log.info(f'GetName: {request.id}')

        name = ''

        try:
            obj = ObjectIdDatabase.get(request.id)
            name = obj.get_name()
        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.NameResponse(name=name)

    def CreateProject(self, request, context):
        '''
        Create a new project
        '''

        log.info(f'Create project: {request.name}')

        try:
            project = Project(request.name)
            ZInspector.root.add_project(project)
        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.IdResponse(ids=[project.get_id()])

    def ImportMesh(self, request, context):
        '''
        Import a mesh from a file into a project
        '''

        log.info(f'Import mesh: {request.project}/{request.path}')

        ids = []

        try:
            project = ObjectIdDatabase.get(request.project)
            data = trimesh.load(request.path, file_type='stl')
            mesh = Mesh(os.path.basename(request.path), data)
            project.add_mesh(mesh)
            ids = [mesh.get_id()]

        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.IdResponse(ids=ids)

    def GetMeshData(self, request, context):
        '''
        Get the data of a mesh
        '''

        log.info(f'Get mesh data: {request.id}')

        data = bytes()

        try:
            data = ObjectIdDatabase.get(request.id).data.export(file_type=Configuration.MESH_ENCODING)

            for step, i in enumerate (range(0, len(data), Configuration.MESH_DATA_CHUNK_SIZE)):
                yield zinspector_pb2.MeshChunk(format=Configuration.MESH_ENCODING,
                                               index=step,
                                               data=data[i:i + Configuration.MESH_DATA_CHUNK_SIZE])

        except Exception as e:
            self.__handle_exception__(e, context, grpc.StatusCode.NOT_FOUND)

    def __handle_exception__(self, e, context, status=grpc.StatusCode.UNKNOWN):
        log.error(f'{e}')
        context.set_details(str(e))
        context.set_code(status)


def serve(port):
    '''
    Start the gRPC server and enter its main loop.
    '''

    log.info("Starting server...")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    zinspector_pb2_grpc.add_ZInspectorServicer_to_server(ZInspector(), server)
    server.add_insecure_port(f'[::]:{port}')
    server.start()

    log.info(f'Server started on port {port}')

    server.wait_for_termination()


if __name__ == "__main__":

    # Parse command line arguments
    parser = argparse.ArgumentParser(description="ZInspector server")
    parser.add_argument("--port", type=int, help="Port to listen on")

    args = parser.parse_args()

    serve(args.port)

    log.info('Service stopped')
