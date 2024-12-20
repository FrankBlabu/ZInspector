from concurrent import futures

import argparse
import grpc
import logging
import sys

import zinspector_pb2
import zinspector_pb2_grpc


log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)


class ZInspector(zinspector_pb2_grpc.ZInspectorServicer):
    '''
    Implementation of the ZInspector service
    '''

    def GetGreeting(self, request, _context):
        log.info(f'Received request: {request}')
        name = request.name
        return zinspector_pb2.GreetingResponse(message=f"Hello, {name}!")

    def LoadModel(self, request, context):
        log.info(f'Load file: {request.path}')

        try:
            with open(request.path, 'rb') as f:
                contents = f.read()

            log.info(f'Loaded {len(contents)} bytes from {request.path}')
        except Exception as e:
            log.error(f'Failed to load file: {e}')
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.NOT_FOUND)

        return zinspector_pb2.Empty()


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
