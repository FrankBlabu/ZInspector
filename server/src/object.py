#
# object.py - Object management
#

import uuid
import weakref


class ObjectIdDatabase:
    """Singleton class to store and manage objects by their UUID."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ObjectIdDatabase, cls).__new__(cls)
            cls._instance._storage = {}
        return cls._instance

    def add(self, obj):
        """Add an object to the database."""
        obj_id = obj.id
        self._storage[obj_id] = weakref.ref(obj)  # Use weak reference to avoid memory leaks

    def remove(self, obj_id):
        """Remove an object from the database."""
        if obj_id in self._storage:
            del self._storage[obj_id]

    def get(self, obj_id):
        """Retrieve an object by its UUID."""
        obj_ref = self._storage.get(obj_id)
        if obj_ref is None:
            raise KeyError(f"Object with UUID {obj_id} not found.")
        obj = obj_ref()
        if obj is None:
            raise KeyError(f"Object with UUID {obj_id} has been garbage-collected.")
        return obj

    def list_objects(self):
        """List all currently stored objects."""
        return {obj_id: obj_ref() for obj_id, obj_ref in self._storage.items() if obj_ref() is not None}


class Object:
    """Base class for all objects with a unique UUID."""

    def __init__(self, name):
        self.id = str(uuid.uuid4())  # Assign a unique UUID
        self.name = name
        ObjectIdDatabase().add(self)  # Automatically register the object in the database

    def get_name(self):
        """Get the name of the object."""
        return self.name

    def get_id(self):
        """Get the UUID of the object."""
        return self.id

    def __del__(self):
        ObjectIdDatabase().remove(self.id)  # Automatically deregister the object when it is destructed

    def __repr__(self):
        return f'<{self.__class__.__name__} id={self.id}, name={self.name}>'
