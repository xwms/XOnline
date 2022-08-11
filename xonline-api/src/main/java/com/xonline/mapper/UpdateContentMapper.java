package com.xonline.mapper;

import com.xonline.pojo.sql.UpdateContent;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@Mapper
@Repository
public interface UpdateContentMapper {
    List<UpdateContent> queryUpdateList();
    void addContent(UpdateContent updateContent);
    void removeContent(int id);
}
