<?php
namespace poem\more;
class upload {
    /**
     * @cc 上传文件函数
     * @param  [type] $data url         [存储地址]
     * @param  [type] $data size        [限制大小]
     * @param  [type] $data allowedExts [允许后缀]
     * @return [type]              [返回数组] info url ，code 1 成功 0失败，filename文件名
     */
    function fileUpload($data) {

        foreach ($data as $k => $v) {
            if (empty($v)) {return array('code' => 0, 'info' => '参数不能为空：' . $k);}
        }
        if (!is_dir($data['url'])) {return array('code' => 0, 'info' => '路径错误：' . $data['url']);}
        $fileField = $data['fileField'] ?: 'file';
        $file      = $_FILES[$fileField];

        $ext = pathinfo($file["name"], PATHINFO_EXTENSION);
        // 文件过大
        if ($file["size"] > $data['size']) {
            $return = array('code' => 0, 'info' => '文件过大：' . $file["size"] . '，请上传小于：' . $data['size']);
        }
        // 不允许后缀
        elseif (!in_array($ext, $data['allow'])) {
            $return = array('code' => 0, 'info' => '不允许后缀：' . $ext . '请上传：' . implode(',', $data['allow']));
        } else {
            if ($file["error"] > 0) {
                $return = array('code' => 0, 'info' => "Return Code: " . $file["error"]);
            } else {
                if (!$data['filename']) {
                    // $data['filename'] = Date('YmdHis').'_'.$file["name"];
                    $data['filename'] = date('YmdHis') . '_' . uniqid() . '.' . $ext;
                }
                $newfile_url = $data['url'] . $data['filename'];
                move_uploaded_file($file["tmp_name"], $newfile_url);
                $return = array(
                    'code'   => 1,
                    'origin' => $_FILES[$fileField]["name"],
                    'size'   => $_FILES[$fileField]["size"],
                    'name'   => $data['filename'],
                    'type'   => $ext,
                    'info'   => '/' . $newfile_url);
            }
        }
        return $return;
    }

}