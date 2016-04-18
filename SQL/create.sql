drop table if exists users;
create table users (
	id serial not null primary key,
	username varchar(32) not null,
	passwd varchar(32) not null,
	name text not null default '',
	address text not null default '',
	email text not null default '',
	sms text not null default '',
	site_id int not null default 0,
	role text not null default 'Public',
	notes text not null default ''
);
insert into users (id,username,passwd,name,role) values (1,'admin','admin','Admin Bootstrap User','Admin');

drop table if exists site;
create table site (
	id serial not null primary key,
	name text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text not null default '',
	image text not null default '',
	parent_site int not null default 0,
	stock_site int not null default 0,
	notes text not null default '',
	x int not null default 0,
	y int not null default 0,
	alerts_to int not null default 0,
	tasks_to int not null default 0
);

drop table if exists user_site;
create table user_site (
	user_id int not null,
	site_id int not null,
	role text not null 
);
create unique index user_site_idx on user_site (user_id,site_id);

drop table if exists user_role;
create table user_role (
	user_id int not null,
	site_id int not null,
	worker boolean not null default false,
	sitemgr boolean not null,
	contractor boolean not null
);
create unique index user_role_idx on user_role (user_id,site_id);

drop table if exists skill;
create table skill (
	id serial not null primary key,
	name text not null,
	notes text not null default ''
);

drop table if exists user_skill;
create table user_skill (
	user_id int not null,
	skill_id int not null
);
create unique index user_skill_idx on user_skill (user_id,skill_id);

drop table if exists sys_log;
create table sys_log (
	id serial not null primary key,
	status int not null default 0,
	type char(8) not null,
	ref_type char(1) not null,
	ref_id int not null,
	logdate timestamptz not null default localtimestamp,
	ip text not null,
	descr text not null,
	user_id int not null,
	username text not null default '',
	before text not null default '',
	after text not null default ''
);
create unique index sys_log_idx on sys_log (logdate,id);
insert into sys_log (id,status,type,ref_type,ref_id,ip,descr,user_id,username)
	values (1,1,'InitData','I',1,'localhost','Initialize Data',1,'Admin');

drop table if exists doc;
create table doc (
	id serial not null primary key,
	name text not null,
	filename text not null,
	path text not null,
	worker boolean not null,
	sitemgr boolean not null,
	contractor boolean not null,
	type text not null,
	ref_id int not null,	
	doc_format int not null default 0,
	notes text not null default '',	
	user_id int not null default 0,
	filesize int not null default 0,
	latest_rev int not null default 0,
	created timestamptz not null default localtimestamp
);
create unique index doc_path_idx on doc (path);

drop table if exists doc_type;
create table doc_type (
	id text not null primary key,
	name text not null
);

drop table if exists doc_rev;
create table doc_rev (
	doc_id int not null,
	id serial not null,
	revdate timestamptz not null default localtimestamp,
	descr text not null,
	filename text not null,
	path text not null,
	filesize int not null default 0,
	user_id int not null default 0
);
create unique index doc_rev_idx on doc_rev (doc_id,id);

drop table if exists machine;
create table machine (
	id serial not null primary key,
	site_id int not null,
	name text not null default '',
	descr text not null default '',
	make text not null default '',
	model text not null default '',
	serialnum text not null,
	is_running boolean not null default false,
	status text not null default '',
	stopped_at timestamptz,
	started_at timestamptz,
	alert_at timestamptz,
	picture text not null default '',
	notes text not null default '',
	electrical text not null default 'Running',
	hydraulic text not null default 'Running',
	printer text not null default 'Running',
	console text not null default 'Running',
	rollbed text not null default 'Running',
	uncoiler text not null default 'Running',
	lube text not null default 'Running',
	alerts_to int not null default 0,
	tasks_to int not null default 0
);

drop table if exists site_layout;
create table site_layout (
	site_id int not null,
	seq int not null,
	machine_id int not null,
	span int not null
);
create index site_layout_idx on site_layout (site_id, seq);

drop table if exists component;
create table component (
	machine_id int not null,
	position int not null default 1,
	zindex int not null default 0,
	id serial not null,
	site_id int not null,
	name text not null,
	descr text not null default '',
	qty int not null default 1,
	make text not null default '',
	model text not null default '',
	serialnum text not null default '',
	stock_code text not null default '',
	picture text not null default '',
	notes text not null default '',
	status text not null default 'Running',
	is_running bool not null default true
);
create unique index component_idx on component (machine_id,id);
create index component_position_idx on component (machine_id,position);

drop table if exists component_part;
create table component_part (
	component_id int not null,
	part_id int not null,
	qty int not null default 1
);
create unique index component_part_idx on component_part (component_id,part_id);

drop table if exists part;
create table part (
	id serial not null primary key,
	name text not null,
	descr text not null default '',
	stock_code text not null,
	reorder_stocklevel numeric(12,2) not null default 1,
	reorder_qty numeric(12,2) not null default 1,
	latest_price numeric(12,2) not null default 0,
	qty_type text not null default 'ea',
	picture text not null default '',
	notes text not null default ''	
);
create unique index part_stock_code_idx on part (stock_code);

drop table if exists vendor;
create table vendor (
	id serial not null primary key,
	name text not null,
	descr text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text not null default '',
	contact_name text not null default '',
	contact_email text not null default '',
	orders_email text not null default '',
	rating text not null default '',
	notes text not null default ''
);

drop table if exists part_vendor;
create table part_vendor (
	part_id int not null,
	vendor_id int not null,
	vendor_code text not null,
	latest_price numeric(12,2) not null
);
create unique index part_vendor_idx on part_vendor (part_id,vendor_id);

drop table if exists vendor_price;
create table vendor_price (
	part_id int not null,
	vendor_id int not null,
	datefrom timestamptz not null default localtimestamp,
	price numeric(12,2) not null,
	min_qty numeric(12,2) not null,
	notes text not null default ''	
);
create unique index vendor_price_idx on vendor_price (part_id,vendor_id,datefrom);

drop table if exists event;
create table event (
	id serial not null primary key,
	site_id int not null,
	type text not null,
	machine_id int not null,
	tool_id int not null,
	tool_type text not null default 'Tool',
	priority int not null,
	status text not null default '',
	startdate timestamptz not null default localtimestamp,
	created_by int not null,
	allocated_by int not null default 0,
	allocated_to int not null default 0,
	completed timestamptz,
	labour_cost money not null default 0.0,
	material_cost money not null default 0.0,
	other_cost money not null default 0.0,
	notes text not null default ''	
);
create index event_site_idx on event (site_id,startdate);
create index event_allocation_idx on event (allocated_to,id);

drop table if exists event_type;
create table event_type (
	id text not null primary key,
	name text not null
);

drop table if exists event_doc;
create table event_doc (
	event_id int not null,
	doc_id int not null,
	doc_rev_id int not null	
);
create unique index event_doc_idx on event_doc (event_id,doc_id);

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

drop table if exists stock_level;
create table stock_level (
	part_id serial not null primary key,
	site_id int not null,
	datefrom timestamptz not null default localtimestamp,
	qty numeric(12,2) not null,
	notes text not null default ''	
);
create index stock_level_idx on stock_level (part_id,site_id);

drop table if exists sm_task;
create table sm_task (
	id serial not null primary key,	
	user_id int not null,
	date timestamptz not null default localtimestamp,
	type text not null default '',
	week int not null default 1,	
	completed timestamptz,
	escalate_date timestamptz,
	escalate_user int,
	status text not null default ''
);
create index sm_task_user_idx on sm_task (user_id, date);

drop table if exists sm_machine;
create table sm_machine (
	task_id int not null,
	machine_id int not null,
	completed timestamptz
);
create index sm_machine_idx on sm_machine (task_id, machine_id);

drop table if exists sm_machine_item;
create table sm_machine_item (
	task_id int not null,
	machine_id int not null,
	seq int not null,
	notes text,
	done boolean not null default false
);
create index sm_machine_item_idx on sm_machine_item (task_id, machine_id, seq);

create table if exists sm_tool;
create table sm_tool (
	task_id int not null,
	machine_id int not null,
	tool_id int not null,
	completed timestamptz,
	mins_spent int not null default 0,
	labour_cost numeric(12,2) not null,
	materal_cost numeric(12,2) not null,
	notes text
);	
create index sm_tool_idx on sm_tool (task_id, machine_id, tool_id);

drop table if exists sm_tool_item;
create table sm_tool_item (
	task_id int not null,
	tool_id int not null,
	seq int not null,
	notes text,
	done boolean not null default false
);
create index sm_tool_item_idx on sm_tool_item (task_id, tool_id, seq);

drop table if exists sm_component;
create table sm_component (
	task_id int not null,
	machine_id int not null,
	component text not null,
	completed timestamptz,
	mins_spent int not null default 0,
	labour_cost numeric(12,2) not null,
	materal_cost numeric(12,2) not null,
	notes text
);	
create index sm_component_idx on sm_tool (task_id, machine_id, tool_id);

drop table if exists sm_component_item;
create table sm_component_item (
	task_id int not null,
	component text not null,
	seq int not null,
	notes text,
	done boolean not null default false
);
create index sm_component_item_idx on sm_component_item (task_id, component, seq);

drop table if exists sm_parts;
create table sm_parts (
	task_id int not null,
	part_id int not null,
	date timestamptz not null default localtimestamp,
	qty numeric(12,2) not null,
	value numeric(12,2) not null
);
create index sm_part_idx on sm_parts (task_id, part_id, date);

-- Sched Task Freq types
---------------------------------------------------------
-- Old way of dividing periods --

-- Monthly  / Week N of the month  (n = 1..4)
-- Weekly
-- Days     / Every N days  (n = 1..365)
-- Relative / N days after parent complete  (n = 1..365)
-- Yearly   / Nth day of the year (n = 1..365)

-- Regular   / + tick which weeks of the month apply
-- Days      / + set number of days
-- Relative  / + set number of days
---------------------------------------------------------

drop table if exists sched_task;
create table sched_task (
	id serial not null primary key,	
	machine_id int not null,
	comp_type text not null default 'C',
	tool_id int not null,
	component text not null default '',
	descr text not null default '',
	startdate date,
	oneoffdate date,
	freq text not null default 'R',
	parent_task int,
	days int,
	count int,
	week int,
	duration_days int not null default 1,
	labour_cost numeric(12,2) not null,
	material_cost numeric(12,2) not null,
	other_cost_desc text[],
	other_cost numeric(12,2)[]
);

drop table if exists sched_task_part;
create table sched_task_part (
	task_id int not null,
	part_id int not null,
	qty numeric(12,2) not null,
	notes text not null default ''	
);
create unique index sched_task_part_idx on sched_task_part(task_id, part_id);

drop table if exists sched_control;
create table sched_control (
	id int not null primary key,
	last_run date
);

drop table if exists sched_control_task;
create table sched_control_task (
	task_id int not null,
	last_gen date,
	last_jobcount int
);


drop table if exists task;
create table task (
	id serial not null primary key,
	sched_id int not null default 0,
	machine_id int not null,
	tool_id int not null,
	comp_type text not null default 'C',
	component text not null default '',
	descr text not null default '',
	log text not null default '',
	created_date timestamptz not null default localtimestamp,
	startdate date,
	due_date date,
	escalate_date date,
	assigned_by int,
	assigned_to int,
	assigned_date timestamptz,	
	completed_date timestamptz,
	has_issue boolean not null default false,
	issue_resolved_date timestamptz,
	labour_est numeric(12,2) not null default 0,
	material_est numeric(12,2) not null  default 0,
	labour_cost numeric(12,2) not null default 0,
	material_cost numeric(12,2) not null  default 0,
	other_cost_desc text[],
	other_cost numeric(12,2)[] 
);

drop table if exists task_part;
create table task_part (
	task_id int not null,
	part_id int not null,
	qty numeric(12,2) not null,
	notes text not null default ''
);
create unique index task_part_idx on task_part(task_id, part_id);

drop table if exists user_log;
create table user_log (
	id serial not null primary key,
	logdate timestamptz not null default localtimestamp,
	duration text,
	ms int,
	func text,
	input text,
	output text
);
-- create unique index user_log_idx on user_log (logdate,id);

