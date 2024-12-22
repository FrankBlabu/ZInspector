#
# mesh.py - Mesh element
#

import h5py
import io
import numpy as np
import trimesh

from .object import Object


class Mesh (Object):
    '''
    This object represents a mesh. It stores the mesh data and provides methods
    for manipulating it.
    '''

    def __init__(self, name: str, data: trimesh.Trimesh):
        super().__init__(name)
        self.data = data

    def __load__(self, parent: h5py.Group):
        super().__load__(parent)

        dset = parent['data']
        self.data = trimesh.load(io.BytesIO(dset[:]), file_type=dset.attrs['file_type'])

    def __save__(self, parent: h5py.Group):
        """Save the object to an HDF5 group."""
        super().__save__(parent)

        data = np.frombuffer(trimesh.exchange.export.export_stl(self.data), dtype=np.uint8)
        dset = parent.create_dataset('data', data=data)
        dset.attrs['file_type'] = 'stl'

    def __repr__(self):
        return f'<Mesh id={self.get_id()}>'
