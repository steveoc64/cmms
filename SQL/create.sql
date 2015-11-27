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
	role text not null default 'Public'
);
insert into users (id,username,passwd,name,role) values (1,'admin','admin','Admin Bootstrap User','Admin');

drop table if exists site;
create table site (
	id serial not null primary key,
	name text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text not null default '',
	image text not null default ''
);

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
	name text not null
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
	logdate timestamp not null default localtimestamp,
	ip text not null,
	descr text not null,
	user_id int not null,
	username text not null default ''
);
create unique index sys_log_idx on sys_log (logdate,id);
insert into sys_log (id,status,type,ref_type,ref_id,ip,descr,user_id,username)
	values (1,1,'InitData','I',1,'localhost','Initialize Data',1,'Admin');

drop table if exists doc;
create table doc (
	id serial not null primary key,
	name text not null,
	filename text not null,
	worker boolean not null,
	sitemgr boolean not null,
	contractor boolean not null,
	type char(3) not null,
	ref_id int not null,	
	doc_format int not null
);

drop table if exists doc_type;
create table doc_type (
	id char(3) not null primary key,
	name text not null
);

drop table if exists doc_rev;
create table doc_rev (
	doc_id int not null,
	id serial not null,
	revdate timestamp not null default localtimestamp,
	descr text not null,
	filename text not null
);
create unique index doc_rev_idx on doc_rev (doc_id,id);

drop table if exists machine;
create table machine (
	id serial not null primary key,
	site_id int not null,
	name text not null,
	descr text not null,
	make text not null,
	model text not null,
	serialnum text not null,
	is_running boolean not null,
	stopped_at timestamp,
	started_at timestamp,
	picture text not null
);

drop table if exists component;
create table component (
	machine_id int not null,
	id serial not null,
	site_id int not null,
	name text not null,
	descr text not null,
	make text not null,
	model text not null,
	picture text not null
);
create unique index component_idx on component (machine_id,id);

drop table if exists component_part;
create table component_part (
	component_id int not null,
	part_id int not null
);
create unique index component_part_idx on component_part (component_id,part_id);

drop table if exists part;
create table part (
	id serial not null primary key,
	name text not null,
	descr text not null,
	stock_code text not null,
	reorder_stocklevel numeric(12,2) not null,
	reorder_qty numeric(12,2) not null,
	latest_price numeric(12,2) not null,
	qty_type text not null,
	picture text not null
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
	datefrom timestamp not null,
	price numeric(12,2) not null,
	min_qty numeric(12,2) not null
);
create unique index vendor_price_idx on vendor_price (part_id,vendor_id,datefrom);

drop table if exists event;
create table event (
	id serial not null primary key,
	site_id int not null,
	type char(3) not null,
	ref_id int not null,
	priority int not null,
	startdate timestamp not null default localtimestamp,
	parent_event int not null,
	created_by int not null,
	allocated_by int not null,
	allocated_to int not null,
	completed timestamp,
	labour_cost money not null,
	material_cost money not null,
	other_cost money not null
);
create index event_site_idx on event (site_id,startdate);
create index event_allocation_idx on event (allocated_to,id);

drop table if exists event_type;
create table event_type (
	id char(3) not null primary key,
	name text not null
);

drop table if exists event_doc;
create table event_doc (
	event_id int not null,
	doc_id int not null,
	doc_rev_id int not null
);
create unique index event_doc_idx on event_doc (event_id,doc_id);

drop table if exists stock_level;
create table stock_level (
	part_id serial not null primary key,
	site_id int not null,
	datefrom date not null default localtimestamp,
	qty numeric(12,2) not null
);
create index stock_level_idx on stock_level (part_id,site_id);





