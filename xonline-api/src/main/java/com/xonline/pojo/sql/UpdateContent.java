package com.xonline.pojo.sql;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateContent {
    private int id;
    private String version;
    private String content;
    private Date time;
}
