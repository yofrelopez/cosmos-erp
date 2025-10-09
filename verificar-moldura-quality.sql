-- Consulta para ver los valores del enum PricingMoldingQuality
SELECT unnest(enum_range(NULL::"PricingMoldingQuality")) AS valid_quality;