#
# project.py - Project data storage
#

import h5py
import io
import trimesh

import numpy as np

from .object import Object


class Project (Object):
    '''
    This object represents a project. It stored all the projects data including the
    large blobs
    '''

    def __init__(self):
        super().__init__()
        self.filename = None
        self.meshes = {}

    def load(self, filename: str):
        '''
        Load the project data from disk.
        '''
        self.meshes = {}

        with h5py.File(filename, 'r') as f:
            for name, data in f['meshes'].items():
                self.meshes[name] = trimesh.load(io.BytesIO(data[:]), file_type='stl')

        self.filename = filename

    def save(self, filename: str):
        '''
        Save the project data to disk.
        '''

        with h5py.File(filename, 'w') as f:
            meshes = f.create_group('meshes')
            for name, mesh in self.meshes.items():
                data = np.frombuffer(trimesh.exchange.export.export_stl(mesh), dtype=np.uint8)
                dset = meshes.create_dataset(name, data=data)
                dset.attrs['file_type'] = 'stl'

        self.filename = filename

    def get_mesh(self, name: str) -> trimesh.Trimesh:
        '''
        Get a mesh from the project.
        '''
        return self.meshes[name]

    def add_mesh(self, name: str, mesh: trimesh.Trimesh):
        '''
        Add a mesh to the project.
        '''
        self.meshes[name] = mesh

    def __repr__(self):
        return f'<Project filename={self.filename} meshes={list(self.meshes.keys())}, id={self.get_id()}>'
