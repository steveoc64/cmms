drop table if exists users;
create table users (
	id serial primary key,
	username varchar(32) not null,
	passwd varchar(32) not null,
	name text not null,
	address text,
	email text not null,
	sms text,
	avatar text,
	site_id int not null default 0,
	role text not null default 'public'
);

drop table if exists site;
create table site (
	id serial primary key,
	name text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text,
	image text
);

drop table if exists user_role;
create table user_role (
	user_id int not null,
	site_id int not null,
	worker boolean not null default false,
	sitemgr boolean,
	contractor boolean
);
create unique index user_role_idx on user_role (user_id,site_id);

drop table if exists skill;
create table skill (
	id serial primary key,
	name text
);

drop table if exists user_skill;
create table user_skill (
	user_id int,
	skill_id int
);
create unique index user_skill_idx on user_skill (user_id,skill_id);

drop table if exists user_log;
create table user_log (
	user_id int not null,
	logdate timestamp not null default localtimestamp,
	ip text not null,
	descr text not null
);
create unique index user_log_idx on user_log (user_id,logdate);

drop table if exists sys_log;
create table sys_log (
	id serial primary key,
	logdate timestamp,
	ip text,
	descr text
);

drop table if exists doc;
create table doc (
	id serial primary key,
	name text,
	filename text,
	worker boolean,
	sitemgr boolean,
	contractor boolean,
	type char(3),
	ref_id int,	
	doc_format int,
	avatar text
);

drop table if exists doc_type;
create table doc_type (
	id char(3) primary key,
	name text
);

drop table if exists doc_rev;
create table doc_rev (
	doc_id int,
	id serial,
	revdate timestamp,
	descr text,
	filename text
);
create unique index doc_rev_idx on doc_rev (doc_id,id);

drop table if exists machine;
create table machine (
	id serial primary key,
	site_id int,
	name text,
	descr text,
	make text,
	model text,
	serialnum text,
	is_running boolean,
	stopped_at timestamp,
	started_at timestamp,
	picture text
);

drop table if exists component;
create table component (
	machine_id int,
	id serial,
	site_id int,
	name text,
	descr text,
	make text,
	model text,
	picture text
);
create unique index component_idx on component (machine_id,id);

drop table if exists component_part;
create table component_part (
	component_id int,
	part_id int
);
create unique index component_part_idx on component_part (component_id,part_id);

drop table if exists part;
create table part (
	id serial primary key,
	name text,
	descr text,
	stock_code text,
	reorder_stocklevel numeric(12,2),
	reorder_qty numeric(12,2),
	latest_price numeric(12,2),
	qty_type text,
	picture text
);

drop table if exists part_vendor;
create table part_vendor (
	part_id int,
	vendor_id int,
	vendor_code text,
	latest_price numeric(12,2)
);
create unique index part_vendor_idx on part_vendor (part_id,vendor_id);

drop table if exists vendor_price;
create table vendor_price (
	part_id int,
	vendor_id int,
	datefrom timestamp,
	price numeric(12,2),
	min_qty numeric(12,2)
);
create unique index vendor_price_idx on vendor_price (part_id,vendor_id,datefrom);

drop table if exists event;
create table event (
	id serial primary key,
	site_id int,
	type char(3),
	ref_id int,
	priority int,
	startdate timestamp,
	parent_event int,
	created_by int,
	allocated_by int,
	allocated_to int,
	completed timestamp,
	labour_cost money,
	material_cost money,
	other_cost money
);
create index event_site_idx on event (site_id,startdate);
create index event_allocation_idx on event (allocated_to,id);

drop table if exists event_type;
create table event_type (
	id char(3) primary key,
	name text
);

drop table if exists event_doc;
create table event_doc (
	event_id int,
	doc_id int,
	doc_rev_id int
);
create unique index event_doc_idx on event_doc (event_id,doc_id);

drop table if exists stock_level;
create table stock_level (
	part_id serial primary key,
	site_id int,
	datefrom date,
	qty numeric(12,2)
);
create index stock_level_idx on stock_level (part_id,site_id);





