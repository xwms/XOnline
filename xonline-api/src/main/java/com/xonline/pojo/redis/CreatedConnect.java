package com.xonline.pojo.redis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@Component
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CreatedConnect {
    private String name;
    private String des;
    private String code;
}
