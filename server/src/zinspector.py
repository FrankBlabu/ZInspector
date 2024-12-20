from concurrent import futures
import grpc
import zinspector_pb2
import zinspector_pb2_grpc

# Define the service implementation


class MyService(zinspector_pb2_grpc.MyServiceServicer):
    def GetGreeting(self, request, context):
        name = request.name
        return zinspector_pb2.GreetingResponse(message=f"Hello, {name}!")

# Start the gRPC server


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    zinspector_pb2_grpc.add_MyServiceServicer_to_server(MyService(), server)
    server.add_insecure_port('[::]:50051')  # Run on port 50051
    print("Server started on port 50051")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
