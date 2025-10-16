from fastapi import APIRouter, Depends
from ..controllers import goalController as ctl
from ..models.goalModel import GoalCreate, GoalUpdate
from ..utils.jwtHandler import get_current_user_id

router = APIRouter()


@router.get("")
async def get_my_goal(user_id: str = Depends(get_current_user_id)):
  return await ctl.get_goal(user_id)


@router.post("")
async def upsert(payload: GoalCreate, user_id: str = Depends(get_current_user_id)):
  return await ctl.upsert_goal(user_id, payload)


@router.put("/{goal_id}")
async def update(goal_id: str, payload: GoalUpdate, user_id: str = Depends(get_current_user_id)):
  return await ctl.update_goal(user_id, goal_id, payload)


@router.delete("/{goal_id}")
async def delete(goal_id: str, user_id: str = Depends(get_current_user_id)):
  return await ctl.delete_goal(user_id, goal_id)


@router.get("/progress")
async def progress(user_id: str = Depends(get_current_user_id)):
  return await ctl.compute_goal_progress(user_id)


@router.get("/progress")
async def progress(user_id: str = Depends(get_current_user_id)):
  return await ctl.compute_goal_progress(user_id)
