#
# project.py - Project data storage
#

import h5py
import io
import trimesh

import numpy as np

from .object import Object


class Mesh (Object):
    '''
    This object represents a mesh. It stores the mesh data and provides methods
    for manipulating it.
    '''

    def __init__(self, name: str, mesh: trimesh.Trimesh):
        super().__init__(name)
        self.data = mesh

    def __repr__(self):
        return f'<Mesh id={self.get_id()}>'


class Project (Object):
    '''
    This object represents a project. It stored all the projects data including the
    large blobs
    '''

    def __init__(self, name):
        super().__init__(name)
        self.filename = None
        self.meshes = []

    def load(self, filename: str):
        '''
        Load the project data from disk.
        '''
        self.meshes = []

        with h5py.File(filename, 'r') as f:
            for id, data in f['meshes'].items():
                self.meshes.append(Mesh(trimesh.load(io.BytesIO(data[:]), file_type='stl')))

        self.filename = filename

    def save(self, filename: str):
        '''
        Save the project data to disk.
        '''

        with h5py.File(filename, 'w') as f:
            meshes = f.create_group('meshes')
            for mesh in self.meshes:
                data = np.frombuffer(trimesh.exchange.export.export_stl(mesh.data), dtype=np.uint8)
                dset = meshes.create_dataset(name=mesh.get_id(), data=data)
                dset.attrs['file_type'] = 'stl'

        self.filename = filename

    def add_mesh(self, mesh: Mesh):
        '''
        Add a mesh to the project.
        '''
        self.meshes.append(mesh)

    def __repr__(self):
        return f'<Project filename={self.filename} #meshes={len(self.meshes)}, id={self.get_id()}>'
