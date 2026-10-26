package com.example.app;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class RecordController {
    private static final String EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final DataRecordRepository repo;
    private final ObjectMapper mapper;

    public RecordController(DataRecordRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @GetMapping("/{key}")
    public List<Map<String, Object>> all(@PathVariable String key) {
        return repo.findByProjectKeyOrderByIdDesc(key).stream().map(this::view).toList();
    }

    @PostMapping("/{key}")
    public ResponseEntity<?> create(@PathVariable String key, @RequestBody Map<String, Object> body) {
        String error = validate(body);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("message", error));
        }
        return ResponseEntity.status(201).body(view(repo.save(new DataRecord(key, json(body)))));
    }

    @PutMapping("/{key}/{id}")
    public ResponseEntity<?> update(
            @PathVariable String key,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String error = validate(body);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("message", error));
        }
        var record = repo.findById(id).filter(item -> item.getProjectKey().equals(key));
        if (record.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        DataRecord existing = record.get();
        existing.setPayload(json(body));
        return ResponseEntity.ok(view(repo.save(existing)));
    }

    @DeleteMapping("/{key}/{id}")
    public ResponseEntity<Void> delete(@PathVariable String key, @PathVariable Long id) {
        var record = repo.findById(id).filter(item -> item.getProjectKey().equals(key));
        if (record.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repo.delete(record.get());
        return ResponseEntity.noContent().build();
    }

    private String validate(Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            return "Please provide record details.";
        }

        for (var entry : body.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();
            if (value == null || value.toString().isBlank()) {
                return field + " is required.";
            }

            String normalizedField = field.toLowerCase(Locale.ROOT);
            if (normalizedField.contains("email")
                    && !value.toString().matches(EMAIL_PATTERN)) {
                return "Enter a valid email address.";
            }

            if (isNumericField(normalizedField)) {
                BigDecimal number;
                try {
                    number = new BigDecimal(value.toString());
                } catch (NumberFormatException exception) {
                    return field + " must be numeric.";
                }

                if (number.signum() < 0) {
                    return field + " cannot be negative.";
                }
                if (isPositiveField(normalizedField) && number.signum() == 0) {
                    return field + " must be greater than zero.";
                }
                if (normalizedField.equals("marks") && number.compareTo(BigDecimal.valueOf(100)) > 0) {
                    return "Marks must be between 0 and 100.";
                }
                if (normalizedField.equals("rating")
                        && (number.compareTo(BigDecimal.ONE) < 0
                                || number.compareTo(BigDecimal.valueOf(5)) > 0
                                || number.stripTrailingZeros().scale() > 0)) {
                    return "Rating must be a whole number from 1 to 5.";
                }
            }
        }
        return null;
    }

    private boolean isNumericField(String field) {
        return field.contains("amount")
                || field.contains("price")
                || field.contains("expense")
                || field.equals("marks")
                || field.equals("rating")
                || field.equals("quantity")
                || field.equals("days")
                || field.equals("travellers");
    }

    private boolean isPositiveField(String field) {
        return field.equals("amount")
                || field.equals("price")
                || field.equals("days")
                || field.equals("travellers");
    }

    private String json(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize record payload.", exception);
        }
    }

    private Map<String, Object> view(DataRecord record) {
        try {
            Map<String, Object> result = mapper.readValue(record.getPayload(), MAP_TYPE);
            result.put("id", record.getId());
            return result;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not read record payload.", exception);
        }
    }
}
