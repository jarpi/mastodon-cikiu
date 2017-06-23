collection @usersNearBy
extends 'api/v1/accounts/show'
node(:distanceinkm)    { |account| account.distanceinkm }
