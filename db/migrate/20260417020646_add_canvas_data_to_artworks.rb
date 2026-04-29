class AddCanvasDataToArtworks < ActiveRecord::Migration[8.0]
  def change
    # これ1行だけでOKです！
    add_column :artworks, :canvas_data, :text
  end
end