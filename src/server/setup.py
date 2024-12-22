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
        src_dir = "."  # Directory containing your Python source files

        os.makedirs(self.output_dir, exist_ok=True)

        # Step 1: Compile .proto files into gRPC Python files
        for file in os.listdir(src_dir):
            if file.endswith(".proto"):
                protoc_command = [
                    "grpc_tools.protoc",
                    f"--proto_path={src_dir}",
                    f"--python_out={self.output_dir}",
                    f"--grpc_python_out={self.output_dir}",
                    os.path.join(src_dir, file)
                ]
                if protoc.main(protoc_command) != 0:
                    raise RuntimeError(f"Failed to compile {proto_file}")

        # Step 2: Copy source files to the output directory
        for root, _, files in os.walk(src_dir):
            rel_path = os.path.relpath(root, src_dir)
            target_dir = os.path.join(self.output_dir, rel_path)
            os.makedirs(target_dir, exist_ok=True)

            for file in files:
                if file.endswith(".py") or file.endswith(".proto"):
                    src_file = os.path.join(root, file)
                    shutil.copy(src_file, target_dir)


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
