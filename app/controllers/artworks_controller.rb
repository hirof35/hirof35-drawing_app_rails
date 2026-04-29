class ArtworksController < ApplicationController
  def index
    # まだデータが1つもない場合のために、最初の1つを作成するか取得する
    #@artwork = Artwork.first_or_create(title: "新規作品")
    # 最初の1件を取得、なければ作成
    @artwork = Artwork.first || Artwork.create(title: "My First Art")
    # ログイン機能（Devise等）を入れていない場合は、一旦IDを固定にするか
    # 以下の行をコメントアウト/修正してください
    # @current_user_id = 1
  end

  def show
  end
  def update
    @artwork = Artwork.find(params[:id])
    if params[:image_data].present?
      # Base64を画像として保存 (OGP/プレビュー用)
      data = params[:image_data].split(',')[1]
      @artwork.image.attach(io: StringIO.new(Base64.decode64(data)), filename: "art.png", content_type: 'image/png')
    end
      #保存機能
    @artwork = Artwork.find(params[:id])
    if @artwork.update(artwork_params)
      render json: { message: "保存成功" }, status: :ok
    else
      render json: { error: "保存失敗" }, status: :unprocessable_entity
    end
  end
  
  # app/channels/drawing_channel.rb
  def draw(data)
    ActionCable.server.broadcast("drawing_#{params[:room_id]}", data)
  end
  private

  def artwork_params
    # canvas_data カラムへの保存を許可する
    params.require(:artwork).permit(:canvas_data, :title)
  end
end
