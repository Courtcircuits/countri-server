-- create database with postgresql normalization
drop table if exists users cascade;

drop table if exists room cascade;

create table room(
    room_id serial primary key,
    title text not null
);



create table users(
    user_id serial primary key,
    name text not null,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    profile_picture text
);

drop table if exists transaction;

create table transaction(
    transaction_id serial primary key,
    room_id int not null,
    receiver_id int not null,
    sender_id int not null,
    amount int not null,
    title text not null,
    type text not null,
    created_at timestamp default now(),
    constraint fk_room_transaction foreign key (room_id) references room(room_id) on delete cascade,
    constraint fk_receiver_user_transaction foreign key (receiver_id) references users(user_id) on delete cascade,
    constraint fk_sender_user_transaction foreign key (sender_id) references users(user_id) on delete cascade
);

drop table if exists belong_to_room;

create table belong_to_room(
    room_id int not null,
    user_id int not null,
    constraint fk_room_belong foreign key (room_id) references room(room_id) on delete cascade,
    constraint fk_user_belong foreign key (user_id) references users(user_id) on delete cascade,
    constraint pk_belong_to_room primary key (room_id, user_id)
);

drop table if exists local_user;

create table local_user(
    id serial primary key,
    email text not null,
    password text not null,
    remember_me_token text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

drop table if exists federal_credentials;

create table federal_credentials(
    id serial primary key,
    auth_user_id int not null,
    user_id int not null,
    auth_provider text not null,
    constraint fk_local_user foreign key (auth_user_id) references local_user(id) on delete cascade,
    constraint fk_user_federal foreign key (user_id) references users(user_id) on delete cascade
);

drop table if exists api_tokens;

create table api_tokens(
    id serial primary key,
    name text not null,
    user_id int not null,
    token text not null,
    created_at timestamp default now(),
    expires_at timestamp default now(),
    type text not null,
    constraint fk_user_api_token foreign key (user_id) references users(user_id) on delete cascade
);