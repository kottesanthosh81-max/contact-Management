package com.example.app;
import jakarta.persistence.*;
@Entity
@Table(name="app_records")
public class DataRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=80) private String projectKey;
 @Lob @Column(nullable=false) private String payload;
 public DataRecord(){}
 public DataRecord(String projectKey,String payload){this.projectKey=projectKey;this.payload=payload;}
 public Long getId(){return id;} public String getProjectKey(){return projectKey;} public String getPayload(){return payload;}
 public void setProjectKey(String v){projectKey=v;} public void setPayload(String v){payload=v;}
}
