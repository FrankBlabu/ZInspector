#
# object.py - Object management
#

import h5py
import uuid
import weakref

from abc import ABC, abstractmethod


class ObjectIdDatabase:
    """Singleton class to store and manage objects by their UUID."""
    _storage = {}

    @staticmethod
    def add(obj):
        """Add an object to the database."""
        ObjectIdDatabase._storage[obj.id] = weakref.ref(obj)  # Use weak reference to avoid memory leaks

    @staticmethod
    def remove(obj_id):
        """Remove an object from the database."""
        if obj_id in ObjectIdDatabase._storage:
            del ObjectIdDatabase._storage[obj_id]

    @staticmethod
    def get(obj_id):
        """Retrieve an object by its UUID."""
        obj_ref = ObjectIdDatabase._storage.get(obj_id)
        if obj_ref is None:
            raise KeyError(f"Object with UUID {obj_id} not found.")
        obj = obj_ref()
        if obj is None:
            raise KeyError(f"Object with UUID {obj_id} has been garbage-collected.")
        return obj

    @staticmethod
    def list_objects():
        """List all currently stored objects."""
        return {obj_id: obj_ref() for obj_id, obj_ref in ObjectIdDatabase._storage.items() if obj_ref() is not None}


class Object:
    """Base class for all objects with a unique UUID."""

    def __init__(self, name):
        self.id = str(uuid.uuid4())  # Assign a unique UUID
        self.name = name

        ObjectIdDatabase.add(self)  # Automatically register the object in the database

    def get_name(self):
        """Get the name of the object."""
        return self.name

    def get_id(self):
        """Get the UUID of the object."""
        return self.id

    def get_children(self):
        """Get a list of child objects."""
        return []

    def __del__(self):
        ObjectIdDatabase.remove(self.id)  # Automatically deregister the object when it is destructed

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id}, name={self.name}>'

    @abstractmethod
    def __load__(self, parent: h5py.Group):
        """Load the object from an HDF5 group."""
        # The id is not loaded so that all objects are truely unique in the application.
        self.name = parent.attrs['name']

    @abstractmethod
    def __save__(self, parent: h5py.Group):
        """Save the object to an HDF5 group."""
        parent.attrs['id'] = self.id  # Stored for informational purposes only. Will be ignored on load.
        parent.attrs['name'] = self.name
