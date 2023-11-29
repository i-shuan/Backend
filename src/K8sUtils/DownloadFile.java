public class DownloadRequestVO {
    // 这里定义你的属性，确保它们与你的JSON结构相匹配
    private String someField;

    // getters 和 setters
}
@PostMapping("/api/download")
public ResponseEntity<InputStreamResource> downloadFile(@RequestBody DownloadRequestVO downloadRequestVO) {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));

    HttpEntity<DownloadRequestVO> entity = new HttpEntity<>(downloadRequestVO, headers);

    ResponseEntity<InputStreamResource> response = restTemplate.exchange(
            "http://node-js-service/download",
            HttpMethod.POST,
            entity,
            InputStreamResource.class);

    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(response.getBody());
}
