package com.example.app;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DataRecordRepository extends JpaRepository<DataRecord,Long>{ List<DataRecord> findByProjectKeyOrderByIdDesc(String projectKey); }
