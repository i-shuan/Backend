public class FileNameExtractor {

    /**
     * 從完整路徑中提取文件名。
     * 
     * @param fullPath 完整的文件路徑
     * @return 提取出的文件名
     */
    public static String extractFileName(String fullPath) {
        if (fullPath == null || fullPath.isEmpty()) {
            return "defaultFileName";
        }

        String[] pathTokens = fullPath.split("/");
        return pathTokens.length > 0 ? pathTokens[pathTokens.length - 1] : "file";
    }
}
