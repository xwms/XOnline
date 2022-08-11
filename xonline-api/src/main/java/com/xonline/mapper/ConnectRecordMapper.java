package com.xonline.mapper;

import com.xonline.pojo.sql.ConnectRecord;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@Mapper
@Repository
public interface ConnectRecordMapper {
    List<ConnectRecord> queryConnectRecordList();
    ConnectRecord queryConnectRecordById(int id);
    void addConnectRecord(ConnectRecord connectRecord);
    void removeConnectRecord(int id);
}
