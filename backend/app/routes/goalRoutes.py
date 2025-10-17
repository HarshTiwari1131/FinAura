from fastapi import APIRouter, Depends
from ..controllers import goalController as ctl
from ..models.goalModel import GoalCreate, GoalUpdate
from ..utils.jwtHandler import get_current_user_id
from ..utils.dbConnect import get_db
from ..utils.notifier import notify

router = APIRouter()


@router.get("")
async def list_goals(user_id: str = Depends(get_current_user_id)):
  return await ctl.list_goals(user_id)


@router.post("")
async def create(payload: GoalCreate, user_id: str = Depends(get_current_user_id)):
  return await ctl.create_goal(user_id, payload)

@router.get("/active")
async def get_active(user_id: str = Depends(get_current_user_id)):
  return await ctl.get_active_goal(user_id)

@router.post("/{goal_id}/active")
async def set_active(goal_id: str, user_id: str = Depends(get_current_user_id)):
  return await ctl.set_active_goal(user_id, goal_id)


@router.put("/{goal_id}")
async def update(goal_id: str, payload: GoalUpdate, user_id: str = Depends(get_current_user_id)):
  return await ctl.update_goal(user_id, goal_id, payload)


@router.delete("/{goal_id}")
async def delete(goal_id: str, user_id: str = Depends(get_current_user_id)):
  return await ctl.delete_goal(user_id, goal_id)

@router.post("/notify-progress")
async def notify_progress(user_id: str = Depends(get_current_user_id)):
  # Compute goal progress and notify user with a concise message
  stats = await ctl.compute_goal_progress(user_id)
  db = await get_db()
  if stats:
    ahead = stats.get("ahead")
    ahead_by = stats.get("aheadBy")
    months_remaining = stats.get("monthsRemaining")
    title = "Goal Update"
    status = "Ahead" if ahead else "Behind"
    text = f"{status} by ₹{ahead_by} • {months_remaining} months remaining"
    try:
      await notify(db, user_id, type="goal", title=title, text=text)
    except Exception:
      pass
  return {"ok": True}


@router.get("/progress")
async def progress(user_id: str = Depends(get_current_user_id)):
  return await ctl.compute_goal_progress(user_id)
