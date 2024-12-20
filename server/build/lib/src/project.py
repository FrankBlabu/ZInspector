#
# project.py - Project data storage
#

import h5py
import io
import trimesh
import typing


class Project:
    '''
    This object represents a project. It stored all the projects data including the
    large blobs
    '''

    def __init__(self, filename: str):
        '''
        '''
        self.filename = filename
        self.meshes = {}

    def load(self):
        '''
        Load the project data from disk.
        '''
        self.meshes = {}

        with h5py.File(self.filename, 'r') as f:
            for name, data in f['meshes'].items():
                self.meshes[name] = trimesh.load(io.BytesIO(data[:]), 'obj')

    def save(self):
        '''
        Save the project data to disk.
        '''
        with h5py.File(self.filename, 'w') as f:
            f.create_group('meshes')
            for name, mesh in self.meshes.items():
                f['meshes'][name] = mesh.export('obj')

    def add_mesh(self, name: str, mesh: trimesh.Trimesh):
        '''
        Add a mesh to the project.
        '''
        self.meshes[name] = mesh
