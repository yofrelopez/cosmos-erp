-- Consulta para ver los valores disponibles del enum UserRole
SELECT unnest(enum_range(NULL::"UserRole")) AS valid_roles;