require 'rails_helper'

describe Settings::Exports::BlockedAccountsController do
  before do
    sign_in Fabricate(:user), scope: :user
  end

  describe 'GET #index' do
    it 'returns a csv of the blocking accounts' do
      get :index, format: :csv

      expect(response).to have_http_status(:success)
      expect(response.content_type).to eq 'text/csv'
      expect(response.headers['Content-Disposition']).to eq 'attachment; filename="blocking.csv"'
    end
  end
end
