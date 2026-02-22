-- Limite max_goals côté serveur : refuser l'insertion d'un goal si le groupe a déjà atteint la limite du plan (ex. free = 1).

create or replace function public.check_goals_max_for_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_plan_id text;
  p_max_goals int;
  current_count int;
begin
  select a.plan_id into p_plan_id
  from public.abonnements a
  where a.group_id = NEW.group_id;
  if p_plan_id is null then
    return NEW;
  end if;

  select p.max_goals into p_max_goals
  from public.plans p
  where p.id = p_plan_id;
  if p_max_goals is null then
    return NEW;
  end if;

  select count(*) into current_count
  from public.goals g
  where g.group_id = NEW.group_id;

  if current_count >= p_max_goals then
    raise exception 'FREE_LIMIT_ONE_GOAL: plan % allows at most % goal(s)', p_plan_id, p_max_goals;
  end if;
  return NEW;
end;
$$;

drop trigger if exists goals_check_max_goals on public.goals;
create trigger goals_check_max_goals
  before insert on public.goals
  for each row
  execute function public.check_goals_max_for_plan();
