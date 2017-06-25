# frozen_string_literal: true

class ProcessHashtagsService < BaseService
  def call(status, tags = [])
    isAlert = status.text =~ (Tag::ALERT_RE)
    puts "isAlert #{isAlert}"
    if isAlert != nil
      puts "IS ALERT!"
      sql = <<-SQL.squish
        SELECT id, username FROM Accounts
        WHERE Accounts.id <> ?
      SQL
      mentioned_accounts = Account.find_by_sql([sql, status.account_id])
      mentioned_accounts.each do |account|
        mentioned_account = Account.find_remote(account.username, nil)
        mentioned_account.mentions.where(status: status).first_or_create(status: status)
        status.mentions.includes(:account).each do |mention|
          mentioned_account = mention.account
          if mentioned_account.local?
            NotifyService.new.call(mentioned_account, mention)
            NotifyService.new.send_push_notification_to_apps
          else
            NotificationWorker.perform_async(stream_entry_to_xml(status.stream_entry), status.account_id, mentioned_account.id)
          end
        end
      end
    end
    tags = status.text.scan(Tag::HASHTAG_RE).map(&:first) if status.local?

    tags.map { |str| str.mb_chars.downcase }.uniq(&:to_s).each do |tag|
      status.tags << Tag.where(name: tag).first_or_initialize(name: tag)
    end
    status.update(sensitive: true) if tags.include?('nsfw')
  end
end
