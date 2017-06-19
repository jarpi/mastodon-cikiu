class AddGeolocationToAccounts < ActiveRecord::Migration[5.0]
  def change
    add_column :accounts, :geolocation, :point
  end
end
