

def calculate_virality_score(reactions: list):
    total = len(reactions)
    
    if total == 0:
        return {
            "score": 0,
            "label": "💀 Low Engagement",
            "like_rate": 0,
            "comment_rate": 0,
            "share_rate": 0,
            "avg_watch_percentage": 0
        }
    
    # count engagements
    total_likes = sum(1 for r in reactions if r["reaction"]["liked"])
    total_comments = sum(1 for r in reactions if r["reaction"]["commented"])
    total_shares = sum(1 for r in reactions if r["reaction"]["shared"])
    total_watch = sum(r["reaction"]["watch_percentage"] for r in reactions)
    
    # calculate rates
    like_rate = total_likes / total
    comment_rate = total_comments / total
    share_rate = total_shares / total
    avg_watch = total_watch / total
    
    # weighted score (shares matter most, then comments, then likes, then watch)
    score = (
        (share_rate * 40) +
        (comment_rate * 30) +
        (like_rate * 20) +
        (avg_watch * 0.10)
    )
    
    # virality label
    if score >= 70:
        label = "🔥 Viral"
    elif score >= 40:
        label = "📈 Trending"
    elif score >= 20:
        label = "👍 Decent"
    else:
        label = "💀 Low Engagement"
    
    return {
        "score": round(score, 2),
        "label": label,
        "like_rate": round(like_rate * 100, 1),
        "comment_rate": round(comment_rate * 100, 1),
        "share_rate": round(share_rate * 100, 1),
        "avg_watch_percentage": round(avg_watch, 1)
    }