InertiaRails.configure do |config|
  # Opt in to the Inertia protocol's always-present errors hash (the
  # InertiaRails 4.0 default) so useForm error handling is consistent.
  config.always_include_errors_hash = true
end
