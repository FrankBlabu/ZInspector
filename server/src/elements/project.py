#
# project.py - Project data storage
#

import h5py
import io
import trimesh

import numpy as np

from .object import Object
from .mesh import Mesh


class Project (Object):
    '''
    This object represents a project. It stored all the projects data including the
    large blobs
    '''

    def __init__(self, name):
        """
        Initialize a new Project instance.

        Args:
            name (str): The name of the project.
        """
        super().__init__(name)
        self.filename = None
        self.meshes = []

    def load(self, filename: str):
        '''
        Load the project data from disk.
        '''
        self.meshes = []

        with h5py.File(filename, 'r') as f:

            project_group = f['project']
            super().__load__(project_group)

            meshes = f['meshes']
            for _, group in meshes.items():
                mesh = Mesh('', None)
                mesh.__load__(group)
                self.meshes.append(mesh)

        self.filename = filename

    def save(self, filename: str):
        '''
        Save the project data to disk.
        '''

        with h5py.File(filename, 'w') as f:

            project_group = f.create_group('project')
            super().__save__(project_group)

            meshes = f.create_group('meshes')
            for mesh in self.meshes:
                group = meshes.create_group(mesh.get_id())
                mesh.__save__(group)

        self.filename = filename

    def add_mesh(self, mesh: Mesh):
        '''
        Add a mesh to the project.
        '''
        self.meshes.append(mesh)

    def __repr__(self):
        return f'<Project filename={self.filename} #meshes={len(self.meshes)}, id={self.get_id()}>'
