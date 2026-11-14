/*!
 * imgcompress.js — 上传前在浏览器端压缩图片
 * 用法：
 *   imgToDataURL(file[, {maxEdge: 1600, quality: 0.85}]) -> Promise<string>
 *   imgListToDataURL(files[, opts]) -> Promise<string[]>   // 保持顺序
 *
 * 规则：
 *   - 长边超过 maxEdge 才缩放，小图不放大
 *   - 统一输出 WebP（浏览器不支持时回退 JPEG）
 *   - GIF 原样返回，避免 canvas 吃掉动画
 *   - 压缩结果反而比原图大时，返回原图
 *   - 任何环节失败都回退原图，绝不阻断上传
 */
(function () {
  'use strict';

  var DEFAULT_MAX_EDGE = 1600;
  var DEFAULT_QUALITY = 0.85;

  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error('读取文件失败')); };
      r.readAsDataURL(file);
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('图片解码失败')); };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      if (!canvas.toBlob) { resolve(null); return; }
      canvas.toBlob(function (b) { resolve(b); }, type, quality);
    });
  }

  function blobToDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error('读取压缩结果失败')); };
      r.readAsDataURL(blob);
    });
  }

  function compress(file, opts) {
    opts = opts || {};
    var maxEdge = opts.maxEdge || DEFAULT_MAX_EDGE;
    var quality = opts.quality || DEFAULT_QUALITY;

    return loadImage(file).then(function (img) {
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;
      if (!w || !h) throw new Error('图片尺寸无效');

      var scale = Math.min(1, maxEdge / Math.max(w, h));
      var tw = Math.max(1, Math.round(w * scale));
      var th = Math.max(1, Math.round(h * scale));

      var canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      var ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 canvas 上下文');
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
      // WebP 支持透明通道，PNG 透明图不会变黑底
      ctx.drawImage(img, 0, 0, tw, th);

      return canvasToBlob(canvas, 'image/webp', quality).then(function (blob) {
        if (!blob) return canvasToBlob(canvas, 'image/jpeg', quality);
        return blob;
      });
    });
  }

  window.imgToDataURL = function (file, opts) {
    if (!file) return Promise.reject(new Error('没有文件'));
    // 非图片（理论上不会走到）或 GIF：不处理
    if (!/^image\//.test(file.type || '')) return fileToDataURL(file);
    if (/gif/i.test(file.type)) return fileToDataURL(file);

    return compress(file, opts).then(function (blob) {
      if (!blob) return fileToDataURL(file);
      // 压完反而更大（典型是几十 KB 的小图），保留原图
      if (blob.size >= file.size) return fileToDataURL(file);
      return blobToDataURL(blob);
    }).catch(function (err) {
      console.warn('[imgcompress] 压缩失败，改用原图：', err && err.message);
      return fileToDataURL(file);
    });
  };

  window.imgListToDataURL = function (files, opts) {
    var arr = Array.prototype.slice.call(files || []);
    return Promise.all(arr.map(function (f) { return window.imgToDataURL(f, opts); }));
  };
})();
