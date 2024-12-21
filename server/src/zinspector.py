from concurrent import futures

import argparse
import grpc
import logging
import os
import sys
import trimesh

import zinspector_pb2
import zinspector_pb2_grpc

from elements.object import ObjectIdDatabase
from elements.project import Project, Mesh
from elements.mesh import Mesh

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s', stream=sys.stdout)


class ZInspector(zinspector_pb2_grpc.ZInspectorServicer):
    '''
    Implementation of the ZInspector service
    '''

    # Top level projects
    projects = []

    def GetObjects(self, request, context):
        '''
        Get a list of objects in the project database
        '''

        log.info(f'GetObjects, parent={request.id}')

        ids = []

        try:
            if request.id and request.id != '':
                parent = ObjectIdDatabase.get(request.id)
                ids = [child.get_id() for child in parent.get_children()]
            else:
                ids = [project.get_id() for project in ZInspector.projects]

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
            ZInspector.projects.append(project)
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
