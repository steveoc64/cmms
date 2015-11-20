delete from users;
insert into users (id,username,passwd,name,email,site_id,role) values 
(1,'steve','abc','steveoc','steveoc64@gmail.com',1,'admin'),
(2,'worker1','abc','bob','worker1@sbsinternational.com',1,'worker'),
(3,'worker2','abc','bill','worker2@sbsinternational.com',2,'worker'),
(4,'worker3','abc','fred','worker3@sbsinternational.com',3,'worker'),
(5,'sitemgr1','abc','jack','sitemgr@sbsinternational.com',1,'sitemgr'),
(6,'sitemgr2','abc','nigel','sitemgr@gsbsinternational.com',2,'sitemgr'),
(7,'admin','abc','horatio','admin@sbsinternational.com',1,'admin');

delete from user_log;

delete from skill;
insert into skill (id,name) values
(1,'Mechanical'),
(2,'Electrical'),
(3,'Hydraulic'),
(4,'General'),
(5,'Other');

delete from user_skill;
insert into user_skill (user_id,skill_id) values 
(1,1),(1,2),
(2,1),
(3,2),
(4,3),
(5,4),(6,4),(7,2);

delete from site;
insert into site (id,name) values 
(1,'R&D Workshop'),
(2,'SBS Edinburgh'),
(3,'SBS Newcastle'),
(4,'SBS Minto'),
(5,'SBS Tomago'),
(6,'SBS Chinderah'),
(7,'SBS Victoria'),
(8,'Thermoloc'),
(9,'Fab Shop'),
(10,'USA Connecticut')
