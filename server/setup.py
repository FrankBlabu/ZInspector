from setuptools import setup, find_packages
from setuptools.command.build_py import build_py
from grpc_tools import protoc

import os
import shutil


class CustomBuildCommand(build_py):
    """Custom build command to generate gRPC files from .proto."""

    user_options = build_py.user_options + [
        ('output-dir=', None, 'Output directory for generated files'),
    ]

    def initialize_options(self):
        super().initialize_options()
        self.output_dir = None

    def finalize_options(self):
        super().finalize_options()
        if self.output_dir is None:
            self.output_dir = "dist"

    def run(self):
        src_dir = "src"  # Directory containing your Python source files
        proto_dir = "protos"  # Directory containing your .proto files

        os.makedirs(self.output_dir, exist_ok=True)

        # Step 1: Compile .proto files into gRPC Python files
        for proto_file in os.listdir(proto_dir):
            if proto_file.endswith(".proto"):
                proto_path = os.path.join(proto_dir, proto_file)
                protoc_command = [
                    "grpc_tools.protoc",
                    f"--proto_path={proto_dir}",
                    f"--python_out={self.output_dir}",
                    f"--grpc_python_out={self.output_dir}",
                    proto_path,
                ]
                if protoc.main(protoc_command) != 0:
                    raise RuntimeError(f"Failed to compile {proto_file}")

        # Step 2: Copy source files to the output directory
        for root, _, files in os.walk(src_dir):
            rel_path = os.path.relpath(root, src_dir)
            target_dir = os.path.join(self.output_dir, rel_path)
            os.makedirs(target_dir, exist_ok=True)

            for file in files:
                if file.endswith(".py"):
                    src_file = os.path.join(root, file)
                    shutil.copy(src_file, target_dir)

        # Step 3: Copy proto files to the output directory
        for root, _, files in os.walk(proto_dir):
            rel_path = os.path.relpath(root, proto_dir)
            target_dir = os.path.join(self.output_dir, rel_path)
            os.makedirs(target_dir, exist_ok=True)

            for file in files:
                if file.endswith(".proto"):
                    proto_file = os.path.join(root, file)
                    shutil.copy(proto_file, target_dir)

        # Run the standard build process
        super().run()


setup(
    name="zinspector",
    version="1.0",
    packages=find_packages(),
    cmdclass={
        'build_py': CustomBuildCommand,
    },
    install_requires=[
        "grpcio",
        "grpcio-tools",
    ],
)
