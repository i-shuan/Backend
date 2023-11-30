public InputStreamResource callExternalService(ReqVo reqVo) {
    HttpEntity<ReqVo> entity = new HttpEntity<>(reqVo, headers);

    String url = genTKSProxyUrl(reqVo.getCluster(), reqVo.getFab());
    
    RestTemplate restTemplate = new RestTemplate();
    ResponseEntity<InputStreamResource> response = restTemplate.exchange(
        url, HttpMethod.POST, entity, InputStreamResource.class);
    
    return response.getBody();
}

@PostMapping(value = "/downloadFile", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
public ResponseEntity<InputStreamResource> downloadFile(@RequestBody DownloadFileVO downloadFileVO) {
    try {
        String fileName = extractFileName(downloadFileVO.getPath());

        InputStreamResource inputStreamResource = callExternalService(downloadFileVO);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/octet-stream");

        return ResponseEntity.ok()
                .headers(headers)
                .body(inputStreamResource);
    } catch (Exception e) {
        // 處理異常...
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
