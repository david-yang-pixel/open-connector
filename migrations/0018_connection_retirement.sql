create table connection_retirements (
  service text not null,
  connection_name text not null,
  generation text not null,
  primary key (service, connection_name)
);

-- Unfenced local consent must restart; stored credentials remain intact.
delete from oauth_states;
alter table oauth_states add column service text;
alter table oauth_states add column connection_name text;
create index oauth_states_connection on oauth_states (service, connection_name);
alter table connection_requests add column connection_name text;
create index connection_requests_connection on connection_requests (service, connection_name);
update connection_requests set phase = 'completed', status = 'failed', value = null,
  error_code = 'authorization_fence_required', error_message = 'Restart authorization after upgrading.'
  where kind = 'local' and phase <> 'completed';
