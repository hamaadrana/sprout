# Processes a photo upload before it is stored: capped at 1600px on the long
# edge, converted to WebP, metadata stripped. The full-resolution phone
# original is never stored.
class PortfolioPhoto
  MAX_EDGE = 1600

  class NotAnImage < StandardError; end

  def self.attach(item, uploaded_file)
    unless uploaded_file.content_type.to_s.start_with?("image/")
      raise NotAnImage, "Only photos can be added to the portfolio"
    end

    processed = ImageProcessing::MiniMagick
      .source(uploaded_file.tempfile.path)
      .resize_to_limit(MAX_EDGE, MAX_EDGE)
      .saver(strip: true)
      .convert("webp")
      .call

    item.image.attach(
      io: File.open(processed.path),
      filename: "work-#{item.taken_on.iso8601}-#{SecureRandom.hex(4)}.webp",
      content_type: "image/webp"
    )
  ensure
    processed.unlink if processed.respond_to?(:unlink)
  end
end
