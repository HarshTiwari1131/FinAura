from bson import ObjectId


def serialize_doc(doc: dict):
    if not doc:
        return doc
    d = dict(doc)
    _id = d.get("_id")
    if isinstance(_id, ObjectId):
        d["_id"] = str(_id)
    return d


def serialize_many(docs):
    return [serialize_doc(d) for d in docs]
