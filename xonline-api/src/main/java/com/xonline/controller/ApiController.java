package com.xonline.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.xonline.mapper.ConnectRecordMapper;
import com.xonline.mapper.UpdateContentMapper;
import com.xonline.pojo.redis.CreatedConnect;
import com.xonline.pojo.sql.ConnectRecord;
import com.xonline.pojo.sql.UpdateContent;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@RestController
public class ApiController {
    private final RedisTemplate<Object,Object> redisTemplate;
    private final ConnectRecordMapper connectRecordMapper;
    private final UpdateContentMapper updateContentMapper;
    public ApiController(RedisTemplate<Object, Object> redisTemplate, ConnectRecordMapper connectRecordMapper, UpdateContentMapper updateContentMapper) {
        this.redisTemplate = redisTemplate;
        this.connectRecordMapper = connectRecordMapper;
        this.updateContentMapper = updateContentMapper;
    }
    @RequestMapping("/App/XOnline/ConnectCode/list")
    public String list() {
        return Objects.requireNonNull(redisTemplate.opsForList().range("con", 0, -1)).toString();
    }
    @PostMapping("/App/XOnline/ConnectCode/add")
    public String add(@RequestParam Map<String,String> map) throws JsonProcessingException {
        Map<String,String> res = new HashMap<>(16);
        if (map.get("name").replaceAll("\\s","").length() != 0 && map.get("des").replaceAll("\\s","").length() != 0 && map.get("code").replaceAll("\\s","").length() != 0) {
            if (map.get("name").length() <= 10 && map.get("des").length() <= 50 && map.get("code").length() <= 33) {
                redisTemplate.opsForList().leftPush("con", new ObjectMapper().writeValueAsString(new CreatedConnect(map.get("name"), map.get("des"), map.get("code"))));
                connectRecordMapper.addConnectRecord(new ConnectRecord(connectRecordMapper.queryConnectRecordList().size()+1,map.get("name"),map.get("des"),map.get("code"),new Date()));
                res.put("success", "ok");
                res.put("data", new Gson().toJson(map));
            }else {
                res.put("error","Input unqualified");
            }
        }else {
            res.put("error","Input is empty");
        }
        return new Gson().toJson(res);
    }
    @PostMapping("/App/XOnline/ConnectCode/remove")
    public String remove(@RequestParam Map<String,String> map) throws JsonProcessingException {
        Map<String,String> res = new HashMap<>(16);
        if (map.get("name").replaceAll("\\s","").length() != 0 && map.get("des").replaceAll("\\s","").length() != 0 && map.get("code").replaceAll("\\s","").length() != 0) {
            if (map.get("name").length() <= 10 && map.get("des").length() <= 50 && map.get("code").length() <= 33) {
                redisTemplate.opsForList().remove("con",0,new ObjectMapper().writeValueAsString(new CreatedConnect(map.get("name"), map.get("des"), map.get("code"))));
                res.put("success","ok");
            }else {
                res.put("error","Input unqualified");
            }
        }else {
            res.put("error","Input is empty");
        }
        return new Gson().toJson(res);
    }
    @RequestMapping("/App/XOnline/Version/latest")
    public UpdateContent queryUpdateList() {
        return updateContentMapper.queryUpdateList().get(updateContentMapper.queryUpdateList().size() - 1);
    }
    @RequestMapping("/BackStage/Data/App/XOnline/ConnectRecord/list")
    public List<ConnectRecord> queryConnectRecordList() {
        return connectRecordMapper.queryConnectRecordList();
    }
    @GetMapping(value = "/BackStage/Data/App/XOnline/ConnectRecord/QueryById/{id}")
    public ConnectRecord queryConnectRecordById(@PathVariable String id) {
        return connectRecordMapper.queryConnectRecordById(Integer.parseInt(id));
    }
    @GetMapping(value = "/BackStage/Data/App/XOnline/ConnectRecord/Remove/{id}")
    public String removeConnectRecord(@PathVariable String id) {
        connectRecordMapper.removeConnectRecord(Integer.parseInt(id));
        return "Delete success";
    }
}