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
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)


class ZInspector(zinspector_pb2_grpc.ZInspectorServicer):
    '''
    Implementation of the ZInspector service
    '''

    # Top level projects
    projects = []

    def GetItems(self, request, context):
        '''
        Get a list of items in the project database
        '''

        log.info(f'GetItems, parent={request.id}')

        ids = []

        try:
            if request.id and request.id != '':
                parent = ObjectIdDatabase.get(request.id)
                ids = [child.get_id() for child in parent.get_children()]
            else:
                ids = [project.get_id() for project in ZInspector.projects]

        except Exception as e:
            log.error(f'Failed to get items: {e}')
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.NOT_FOUND)

        log.debug(f'Result: {ids}')

        return zinspector_pb2.IdResponse(ids=ids)

    def CreateProject(self, request, context):

        log.info(f'Create project: {request.name}')

        project = Project(request.name)
        ZInspector.projects.append(project)

        return zinspector_pb2.IdResponse(ids=[project.get_id()])

    def ImportMesh(self, request, context):

        log.info(f'Import mesh: {request.id}/{request.path}')

        ids = []

        try:
            project = ObjectIdDatabase.get(request.id)
            mesh = trimesh.load(request.path, file_type='stl')
            project.add_mesh(Mesh(os.path.basename(request.path), mesh))
            ids = [mesh.get_id()]

        except Exception as e:
            log.error(f'Failed to load file: {e}')
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.IdResponse(ids=ids)


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
