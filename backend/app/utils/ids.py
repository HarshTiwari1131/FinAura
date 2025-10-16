from bson import ObjectId


def to_obj_id(maybe_id: str | ObjectId):
    if isinstance(maybe_id, ObjectId):
        return maybe_id
    try:
        return ObjectId(str(maybe_id))
    except Exception:
        return None
