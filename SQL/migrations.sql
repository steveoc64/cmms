alter table event add status text not null default '';
alter table event add machine_id int not null default 0;
alter table event add tool_id int not null default 0;
alter table event add site_id int not null default 0;
alter table event drop ref_id;
alter table event drop parent_event:



drop table if exists workorder;
create table workorder (
	id serial not null primary key,
	event_id int not null default 0,
	startdate timestamptz not null default localtimestamp,
	est_duration int not null default 0,
	actual_duration int not null default 0,
	descr text not null default '',
	status text not null default '',
	notes text not null default ''
);

drop table if exists wo_skills;
create table wo_skills (
	id int not null,
	skill_id int not null
);
create unique index wo_skills_idx on wo_skills (id, skill_id);

drop table if exists wo_assignee;
create table wo_assignee (
	id int not null,
	user_id int not null
);
create unique index wo_assignee_idx on wo_assignee (id, user_id);

drop table if exists wo_docs;
create table wo_docs (
	id int not null,
	doc_id int not null
);
create unique index wo_docs_idx on wo_docs (id, doc_id);

alter table machine alter stopped_at type timestamptz;
alter table machine alter started_at type timestamptz;
alter table machine alter alert_at type timestamptz;

alter table vendor_price alter datefrom type timestamptz;
alter table sys_log alter logdate type timestamptz;
alter table doc alter created type timestamptz;
alter table doc_rev alter revdate type timestamptz;

alter table event alter startdate type timestamptz;
alter table event alter completed type timestamptz;

alter table stock_level alter datefrom type timestamptz;

alter table workorder add notes text not null default  '';


alter table component add zindex int not null default 0;

-- alter table event add infrastucture text not null default '';
alter table event add tool_type text not null default 'Tool';


drop table if exists site_layout;
create table site_layout (
	site_id int not null,
	seq int not null,
	machine_id int not null,
	span int not null
);
create index site_layout_idx on site_layout (site_id, seq);

alter table machine add	electrical text not null default 'Running';
alter table machine add	hydraulic text not null default 'Running';
alter table machine add	printer text not null default 'Running';
alter table machine add	console text not null default 'Running';
alter table machine add	rollbed text not null default 'Running';
alter table machine add	uncoiler text not null default 'Running';
alter table machine add	lube text not null default 'Running';


