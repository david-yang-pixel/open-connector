create table mcp_oauth_clients (
  client_id text primary key,
  client_name text not null,
  redirect_uris text not null,
  token_endpoint_auth_method text not null,
  client_secret_hash text,
  created_at text not null,
  last_used_at text
);
create table mcp_oauth_states (
  id text primary key,
  value text not null,
  expires_at text not null,
  consumed_at text,
  issued_token_id text
);
create index mcp_oauth_states_expires on mcp_oauth_states (expires_at);
