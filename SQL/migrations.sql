alter table event add status text not null default '';

alter table event add machine_id int not null default 0;
alter table event add site_id int not null default 0;
alter table event drop ref_id;
alter table event drop parent_event: