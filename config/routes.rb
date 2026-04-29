Rails.application.routes.draw do
  # お絵かき画面をトップページに設定
  root "artworks#index"

  resources :artworks do
    member do
      get :share
    end
  end

  # Action Cable用のパス（既に動いていますが念のため）
  mount ActionCable.server => '/cable'
end