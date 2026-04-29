class CreateArtworks < ActiveRecord::Migration[8.0]
  def change
    create_table :artworks do |t|
      t.string :title
      t.jsonb :canvas_data

      t.timestamps
    end
  end
end
