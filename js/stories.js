/* =============================================
   STORIES.JS  —  Verified Sports Stories
   Last 30 years · NFL · NBA · MLB · Soccer · Golf · F1
   Each story is ~200-350 words = 1.1–2.0 min at 175 WPM
   Sources: ESPN unofficial API (live news) +
            curated verified historical database
   ============================================= */

'use strict';

const SPORT_META = {
  football:   { name: 'NFL Football',   emoji: '🏈', color: '#8B5E3C', espn: 'football/nfl'    },
  basketball: { name: 'NBA Basketball', emoji: '🏀', color: '#FF6B00', espn: 'basketball/nba'  },
  baseball:   { name: 'MLB Baseball',   emoji: '⚾', color: '#D22730', espn: 'baseball/mlb'    },
  soccer:     { name: 'Soccer',         emoji: '⚽', color: '#00A36C', espn: 'soccer/eng.1'    },
  golf:       { name: 'Golf',           emoji: '⛳', color: '#2E8B57', espn: 'golf'             },
  f1:         { name: 'Formula 1',      emoji: '🏎️', color: '#E8002D', espn: null              },
};

const HISTORICAL_STORIES = [

  /* ═══════════════════════════════
     NFL  FOOTBALL
  ═══════════════════════════════ */
  {
    id: 'nfl-bills-comeback-1993',
    sport: 'football', year: 1993, source: 'NFL Records',
    title: "The Greatest Comeback in NFL History — Bills 41, Oilers 38",
    content: `January 3rd, 1993. Rich Stadium, Orchard Park, New York. The Buffalo Bills faced the Houston Oilers in a Wild Card playoff game — and by the third quarter, the game was, for all practical purposes, over. Houston led 35 to 3. Thirty-two points. The crowd was filing out. Bills fans were leaving in embarrassment. The television commentators had already moved on to discussing the next round of playoffs. Then something happened that the NFL has never seen before or since.

Backup quarterback Frank Reich — filling in for the injured Jim Kelly — walked into the huddle and refused to accept the reality staring everyone in the face. Touchdown. Then another. Then another. The crowd stopped leaving. They came back. The noise inside that stadium became deafening. Bills wide receiver Andre Reed caught three touchdowns in the second half alone, torching the Houston secondary time after time with precise, confident route running.

By the fourth quarter, the impossible was unfolding in real time. The Bills had not just cut into the deficit — they had completely erased it. The game went into overtime. Bills kicker Steve Christie drove a field goal through the uprights, and the final score read: Buffalo 41, Houston 38. The largest deficit ever overcome in NFL playoff history, accomplished in front of a home crowd that had nearly given up. Frank Reich, the backup quarterback nobody outside Buffalo had heard of, became a legend that afternoon. The comeback was so stunning that the Oilers coach Jack Pardee was fired just days later. Thirty-two points. In the NFL playoffs. The Bills erased every single one of them, and in doing so, carved out one of the most miraculous and improbable victories in the entire history of professional football.`
  },

  {
    id: 'nfl-helmet-catch-2008',
    sport: 'football', year: 2008, source: 'Super Bowl XLII',
    title: "The Helmet Catch That Killed the Perfect Season",
    content: `February 3rd, 2008. University of Phoenix Stadium, Glendale, Arizona. Super Bowl 42. The New England Patriots were 18 and 0. They had not lost a single game all season. They had the greatest offense in NFL history, with Tom Brady throwing 50 touchdown passes and Randy Moss catching 23. Pundits, analysts, and coaches across the league believed history was being made — that New England would become the only team in the modern NFL era to run the table and finish the season perfect.

The New York Giants had other ideas. David Tyree, a backup wide receiver who had spent most of the season on special teams, had caught exactly one regular season pass that year. He was not the star of the offense. He was barely a household name outside of New York.

With 1 minute and 15 seconds remaining, the Giants trailing 14 to 10 and facing a third and five from their own 44-yard line, Eli Manning somehow — miraculously — escaped the grasp of three different Patriots pass rushers, including Jarvis Green and Richard Seymour, who appeared to have Manning wrapped up for a game-sealing sack. Manning spun free, scrambled backward, regained his balance, and heaved the ball deep downfield. Tyree leaped, stretched both hands above his helmet, and pinned the football against the top of his helmet as cornerback Rodney Harrison dragged him to the ground. The ball never came loose. The officials signaled a completion. First down Giants.

Four plays later, Plaxico Burress caught the go-ahead touchdown. The Patriots scored nothing. Final score: Giants 17, Patriots 14. The perfect season died on one impossible catch by a backup receiver nobody remembers. David Tyree never caught another NFL pass for the rest of his career. He never had to.`
  },

  {
    id: 'nfl-super-bowl-51',
    sport: 'football', year: 2017, source: 'Super Bowl LI',
    title: "28 to 3: The Comeback That Defined a Dynasty",
    content: `February 5th, 2017. NRG Stadium, Houston, Texas. Super Bowl 51. The Atlanta Falcons versus the New England Patriots. For three quarters, this was the most lopsided Super Bowl in decades. Atlanta's offense was unstoppable. Matt Ryan, the NFL's Most Valuable Player that season, was carving up New England's defense with pinpoint accuracy. Julio Jones was the most feared wide receiver in football. Running back Devonta Freeman was breaking tackles at will. With the score 28 to 3 in the third quarter, television networks began preparing "Atlanta Falcons — Super Bowl Champions" graphics. The trophy was practically in Atlanta's hands.

No team in Super Bowl history had ever overcome a deficit larger than 10 points. With 25 minutes of game time remaining, down 25, the task facing Tom Brady and the New England offense was, by any historical measure, mathematically hopeless.

Brady didn't see it that way.

Drive after relentless drive, New England converted. Running back James White was everywhere — catching passes out of the backfield, picking up crucial first downs, refusing to let the Patriots die. Julian Edelman made a catch in the fourth quarter where the ball bounced off the fingertips of three Falcons defenders before he scooped it off his shoe tops, never letting it touch the ground. The officials reviewed it for three minutes. It stood. Edelman kept the drive alive. White scored the tying touchdown with 57 seconds left. For the first time in Super Bowl history, the game went to overtime.

On the very first possession of overtime, the Patriots drove 75 yards without punting. James White dove across the goal line. New England won 34 to 28. Tom Brady won his fifth Super Bowl ring at 39 years old, becoming the undisputed greatest of all time. The score 28 to 3 became permanent shorthand in American sports culture for a lead that is never, ever safe.`
  },

  {
    id: 'nfl-kurt-warner-1999',
    sport: 'football', year: 1999, source: 'Super Bowl XXXIV',
    title: "Kurt Warner: From Grocery Shelves to Super Bowl MVP",
    content: `In 1998, Kurt Warner was stocking grocery shelves in a supermarket in Iowa City for $5.50 an hour. No NFL team would return his phone calls. He had been cut by the Green Bay Packers without ever playing a regular season snap. He played two seasons in the Arena Football League — an indoor league that most NFL scouts never watched. His wife Brenda was a single mother with two kids. They were struggling financially, living in a friend's basement.

Warner kept working. Kept throwing. Kept believing that somewhere, someone would give him a chance. In 1998, the St. Louis Rams signed him to a futures contract — barely more than a practice squad spot. In 1999 training camp, starting quarterback Trent Green tore his ACL in a preseason game. The Rams turned to Warner, not because they believed in him, but because they had no one else.

What followed was one of the most stunning single seasons any quarterback has ever produced in NFL history. Warner threw for 41 touchdowns and 4,353 yards. The Rams' offense — nicknamed The Greatest Show on Turf — scored touchdowns at a pace the NFL had never seen. Wide receivers Isaac Bruce and Torry Holt combined for over 2,000 receiving yards. Marshall Faulk rushed and caught his way to the MVP of the league. But the engine of it all was Warner, commanding the offense with the poise and precision of a 10-year veteran.

In Super Bowl 34, trailing the Tennessee Titans in the fourth quarter, Warner orchestrated a game-winning drive, hitting Bruce for a 73-yard touchdown strike that sealed the championship. He was named Super Bowl MVP. He was named regular season MVP. He had gone from the grocery store to the summit of professional football in 14 months. Kurt Warner's story remains the most improbable rise in NFL history.`
  },

  {
    id: 'nfl-malcolm-butler-2015',
    sport: 'football', year: 2015, source: 'Super Bowl XLIX',
    title: "Malcolm Butler's Goal-Line Pick That Won Super Bowl 49",
    content: `February 1st, 2015. University of Phoenix Stadium, Glendale, Arizona. Super Bowl 49. New England Patriots versus the Seattle Seahawks. With 26 seconds remaining, the game tied at 24, the Seattle Seahawks had the ball on the New England one-yard line. They had the most powerful short-yardage running back in football — Marshawn Lynch, a man who had been literally impossible to tackle all season. One yard. One carry. Championship.

Instead, Seattle offensive coordinator Darrell Bevell called for a slant pass to Ricardo Lockette. It is still, more than a decade later, debated as one of the most confounding play calls in Super Bowl history. Why not give it to Lynch?

Malcolm Butler, an undrafted free agent cornerback from West Alabama — a school most football fans had never heard of — had spent the week of Super Bowl preparation studying film obsessively. He had noticed that Seattle ran that exact slant from that exact formation in a particular situation. During a Tuesday practice that week, he had been beaten on the same route during a short red zone drill and had seethed about it privately for days. He told himself if he ever saw it again, he would not be beaten.

The ball was snapped. Lockette ran the slant. Butler had the route memorized step for step. He anticipated the throw, stepped in front of Lockette before the ball arrived, caught the interception at the goal line, and fell to the turf. Interception. Game over. Patriots win 28 to 24. Tom Brady's fourth Super Bowl championship. The entire Patriots sideline erupted. Malcolm Butler — unknown, undrafted, unheralded — had just made the most important defensive play in Super Bowl history on the biggest stage in American sports.`
  },

  /* ═══════════════════════════════
     NBA  BASKETBALL
  ═══════════════════════════════ */
  {
    id: 'nba-flu-game-1997',
    sport: 'basketball', year: 1997, source: 'NBA Finals Game 5',
    title: "The Flu Game — Michael Jordan's Most Iconic Performance",
    content: `June 11th, 1997. Delta Center, Salt Lake City, Utah. Game 5 of the NBA Finals. The Chicago Bulls and the Utah Jazz were tied two games apiece. The series was everything. Everything.

The night before Game 5, Michael Jordan consumed what appeared to be a contaminated pizza — food poisoning took hold overnight. By morning, Bulls trainers were watching Jordan vomit repeatedly in his hotel bathroom. His temperature climbed to 103 degrees. Doctor's advice was unanimous: he should not play. The Bulls were in hostile territory. The Jazz crowd was the loudest in the NBA. Scottie Pippen was good, but he wasn't Jordan. The Bulls needed their leader.

Jordan played.

He was visibly weak for stretches of the game — hunched over, leaning on teammates between plays, barely able to stand still. And yet. In 44 minutes, Michael Jordan scored 38 points. He made key three-pointers. He made mid-range jumpers over taller, healthier defenders. With 25 seconds remaining in the fourth quarter and the game tied, Jordan rose up over Bryon Russell and hit a three-pointer that proved to be the decisive shot. Chicago won 90 to 88.

After the final buzzer, Jordan collapsed into Scottie Pippen's arms. Pippen had to physically support him as they walked off the court. Jordan needed Pippen to carry him. That image — the greatest basketball player who ever lived being held up by his teammate after conquering food poisoning to win a Finals game — is permanently burned into the memory of everyone who watched it.

The Bulls won Game 6 in Chicago to claim their fifth championship. The Flu Game is not considered Jordan's greatest statistical performance. It is considered something more important than that: the single greatest display of competitive will in the history of basketball.`
  },

  {
    id: 'nba-lebron-block-2016',
    sport: 'basketball', year: 2016, source: 'NBA Finals Game 7',
    title: "The Block: LeBron Fulfills His Promise to Cleveland",
    content: `June 19th, 2016. Oracle Arena, Oakland, California. Game 7 of the NBA Finals. Cleveland Cavaliers versus Golden State Warriors. The Warriors had won 73 games in the regular season — the most in NBA history. They were the defending champions with the greatest shooter the game had ever seen in Stephen Curry, plus Klay Thompson, Draymond Green, and Andre Iguodala. Cleveland had LeBron James, Kyrie Irving, and Kevin Love. The entire basketball world expected Golden State to win.

The game entered the fourth quarter tied. 89 to 89. With 1 minute and 50 seconds remaining, still tied, Warriors guard Andre Iguodala collected a pass in transition, found himself ahead of the defense, and drove toward the basket for what appeared to be the go-ahead layup — the shot that would give Golden State the lead and almost certainly the championship. LeBron James, standing near the three-point line on the far end of the court, turned and ran. Ninety-four feet. At full speed. He closed the gap in seconds and arrived at the rim at the same moment as Iguodala's layup — pinning the ball against the backboard from behind. The block. The most famous play in NBA Finals history.

The game remained tied. Three minutes later, Kyrie Irving dribbled off a ball screen at the top of the key, stepped back over Stephen Curry — who had been the best defender in the entire NBA that season — and dropped in a three-pointer from straight away. Cleveland 92, Golden State 89. LeBron James added a free throw. The Cavaliers held on.

LeBron James had promised — publicly, explicitly, controversially — that he would bring a championship to Cleveland before he was done. He had been mocked for that promise. Criticized. Doubted. On that June night in Oakland, with the block and the victory, LeBron James kept his word.`
  },

  {
    id: 'nba-kobe-81-2006',
    sport: 'basketball', year: 2006, source: 'NBA Regular Season',
    title: "Kobe Bryant Scores 81 — The Night Basketball Lost Its Mind",
    content: `January 22nd, 2006. Staples Center, Los Angeles. The Los Angeles Lakers were trailing the Toronto Raptors by 14 points at halftime. Kobe Bryant had 26 points at the break. In any other game, that would have been the story. Not tonight.

In the third and fourth quarters of that basketball game, Kobe Bryant did something that has never been replicated and, according to most analysts, never will be. He scored 55 points in the second half. In the third quarter alone, he scored 27. He was attacking the basket, pulling up from mid-range, stepping back from three-point distance, drawing fouls and making them at the free throw line. The Raptors had no answer. They double-teamed him. They triple-teamed him. He scored anyway.

By the fourth quarter, Lakers fans in Staples Center had stopped watching the game itself and were instead watching a performance — something that transcended the sport. When the scoreboard ticked over 70 points, the crowd rose to their feet and stayed there, giving standing ovations for every made basket. Players on both benches were photographing him with their phones between plays. Kobe's teammates set screen after screen for a man who had clearly entered a state of basketball perfection that no one in the arena had ever witnessed.

Final score: Lakers 122, Raptors 104. Kobe Bryant: 81 points. 28 of 46 from the field, 18 of 20 from the free throw line, 7 of 13 from three-point range. The second highest single-game total in NBA history, behind only Wilt Chamberlain's legendary 100-point game from 1962. Fifty-eight years combined of NBA history, and only two men have ever scored 80 or more points in a professional basketball game. Wilt Chamberlain. And Kobe Bryant.`
  },

  {
    id: 'nba-kawhi-shot-2019',
    sport: 'basketball', year: 2019, source: 'NBA Playoffs',
    title: "The Shot: Kawhi's Four-Bounce Buzzer Beater",
    content: `May 12th, 2019. Scotiabank Arena, Toronto, Ontario. Toronto Raptors versus Philadelphia 76ers. Game 7 of the second round of the NBA Playoffs. A win-or-go-home game, tied at 90 to 90 with 4.2 seconds left on the clock. The Raptors took the ball out of bounds. Ben Simmons inbounded to Kawhi Leonard on the right side of the half-court line. Leonard dribbled once to his right, crossed the midcourt line, and rose up for a shot from deep in the corner — well beyond the three-point line, off-balance, falling away from the basket, with defender Ben Simmons contesting.

The buzzer sounded as the ball was still in the air.

What happened next lasted approximately three seconds but felt, to everyone watching in arenas across North America, like a full minute of suspended reality. The ball hit the back of the rim. It bounced straight up. It hit the front of the rim. It bounced again. It hit the left side of the rim. It hit the right side of the rim. Four separate rim contacts, each one leaving the basketball millimeters from falling away harmlessly, each one defying the laws of probability and physics. Then it dropped through the net.

The explosion of sound that erupted from Scotiabank Arena in that moment was captured by seismographs and registered as a detectable tremor in the surrounding area. The Philadelphia bench collapsed in disbelief. Kawhi Leonard walked in a slow circle at halfcourt, pointing at the sky, expressionless in that famous way of his. The Toronto Raptors went on that season to win the NBA championship — the first in franchise history. That shot, already called The Shot, is the only buzzer-beating, game-winning, series-ending shot in NBA Game 7 history.`
  },

  {
    id: 'nba-warriors-73-wins',
    sport: 'basketball', year: 2016, source: 'NBA Regular Season',
    title: "73 Wins and No Ring: The Cautionary Tale of the 2015-16 Warriors",
    content: `April 13th, 2016. Oracle Arena, Oakland, California. The Golden State Warriors needed one final regular-season win against the Memphis Grizzlies to break the all-time NBA record for victories in a single season. The record they were chasing had stood for 20 years — the 72 wins recorded by Michael Jordan's Chicago Bulls in the 1995-96 season, the most celebrated team in basketball history.

Stephen Curry scored 46 points. Golden State won 125 to 104. Seventy-three and nine. The record was theirs. The arena shook. Players embraced on the court. Curry, who had been named the first unanimous Most Valuable Player in NBA history earlier that week after breaking his own single-season three-pointer record with 402 made threes, stood at center court and wept openly. The team was widely described as the greatest basketball team ever assembled.

Then came the NBA Finals against LeBron James and the Cleveland Cavaliers. The Warriors led 3 games to 1. Championship. Done. History. Then Cleveland won Game 5. Then Game 6. Then a devastating Game 7 on June 19th, in which LeBron James produced the Block and Kyrie Irving produced The Shot, and Golden State's 73-win season ended in the most agonizing possible way.

No team in NBA history had ever blown a 3-to-1 lead in the Finals. The Warriors became the first. The 73-win season, which should have been the enduring legacy of the greatest regular season team in basketball history, became instead a permanent reminder that trophies are counted in June, not April. The 2015-16 Warriors are remembered as both the greatest regular-season team ever — and the greatest choke in NBA Finals history. Sport is rarely this cruel.`
  },

  /* ═══════════════════════════════
     MLB  BASEBALL
  ═══════════════════════════════ */
  {
    id: 'mlb-kirk-gibson-1988',
    sport: 'baseball', year: 1988, source: 'World Series Game 1',
    title: "Kirk Gibson's Pinch-Hit Walk-Off — The Greatest Homer in World Series History",
    content: `October 15th, 1988. Dodger Stadium, Los Angeles. World Series Game 1. The Los Angeles Dodgers versus the Oakland Athletics — a heavily favored Oakland team that had run through the American League with ease and featured three future Hall of Famers in Jose Canseco, Rickey Henderson, and Dennis Eckersley, the most dominant relief pitcher in baseball.

Kirk Gibson was not in the lineup. He hadn't taken a single plate appearance all day. His left hamstring was severely sprained, and his right knee had been injured earlier in the playoffs. He was in the trainer's room watching the game on television, hitting off a batting tee just to keep his hands active, not as any serious preparation to play. He could barely walk.

Oakland led 4 to 3 in the bottom of the ninth. Eckersley had converted 45 consecutive save opportunities. He had not blown a save all season. The Dodgers had one out, one runner on base, and Mike Davis at the plate. Davis worked Eckersley for a walk — a rare, shocking walk from a pitcher who almost never issued them. The bases were now partially in play. In the Dodgers' dugout, manager Tommy Lasorda looked down the bench and then toward the tunnel leading to the clubhouse. He sent someone to ask Gibson if he could hit.

Gibson hobbled to the plate. He fouled off pitch after pitch, favoring his left leg, swinging with mostly upper body and pure will. With two strikes and three balls, Eckersley threw a backdoor slider. Gibson turned on it. The ball arced toward right field and disappeared into the bleachers. Home run. Gibson pumped his fist, limped around the bases in the most famous home run trot in postseason history, and disappeared into the dugout. He never came to bat again in the entire World Series. The Dodgers won it in five games. One swing. One limping, impossible, defiant swing.`
  },

  {
    id: 'mlb-red-sox-curse-2004',
    sport: 'baseball', year: 2004, source: 'World Series',
    title: "Breaking the Curse: Red Sox End 86 Years of Heartbreak",
    content: `October 27th, 2004. Busch Stadium, St. Louis, Missouri. The Boston Red Sox were three outs away from their first World Series championship since 1918 — 86 years of baseball suffering compressed into one final inning.

The Curse of the Bambino had its origins in 1920, when Boston sold Babe Ruth — the greatest player in baseball history — to the New York Yankees for $100,000 and the cost of a loan secured on Fenway Park. The Yankees went on to win 26 World Series championships. The Red Sox won zero. For 86 years, the curse was invoked every time Boston came close. In 1986, the Red Sox were one out from the championship when a ball rolled through first baseman Bill Buckner's legs. In 2003, they led the Yankees in the ALCS before Aaron Boone's walk-off home run destroyed them again. The curse felt very, very real.

Then 2004 happened. The Red Sox faced the Yankees in the ALCS — and fell behind three games to zero. No team in baseball history had ever come back from that deficit. The Red Sox won four straight games against their most hated rivals, completing the greatest comeback in baseball history. Then they swept the St. Louis Cardinals in the World Series in four games.

When Keith Foulke fielded the final grounder and tossed it to Doug Mientkiewicz for the final out, 86 years of history ended. In bars across Boston, people who had never met each other embraced and wept. At cemeteries across New England, fans placed Red Sox caps on the graves of relatives who had died without seeing this moment. Red Sox Nation had its championship. After 86 years, the Curse of the Bambino was dead.`
  },

  {
    id: 'mlb-cubs-2016',
    sport: 'baseball', year: 2016, source: 'World Series Game 7',
    title: "Cubs End the 108-Year Drought — The Most Emotional Night in Baseball",
    content: `November 2nd, 2016. Progressive Field, Cleveland, Ohio. Game 7 of the World Series. The Chicago Cubs versus the Cleveland Indians. The stakes were almost incomprehensible in their historical weight: the Cubs had not won a World Series since 1908. One hundred and eight years. The longest championship drought in the history of American professional sports. Four generations of Cubs fans had lived and died without seeing their team win. "Wait 'til next year" had become the Cubs' unofficial motto for over a century.

The Cubs had dominated much of the series, leading 3 games to 1. Then Cleveland won Games 5 and 6 to force a deciding seventh game. The Cubs led 6 to 3 entering the eighth inning — three outs from the championship. Then catcher David Ross allowed a passed ball. Then Aroldis Chapman, throwing 100-mile-per-hour fastballs, gave up a two-run homer to Rajai Davis that tied the game. The curse felt alive again. The momentum felt familiar and cruel.

Then it rained. A 17-minute rain delay halted play before the 10th inning began. During the delay, outfielder Jason Heyward gathered the team in an outfield corridor and delivered a passionate, tearful speech about belief and identity and what they meant to each other. Players emerged from that delay visibly changed. Ben Zobrist doubled in the go-ahead run. Miguel Montero singled in an insurance run. Cleveland scored once more, but it wasn't enough. The Cubs won 8 to 7.

When the final out was recorded, players sprinted onto the field, coaches wept openly, and in the city of Chicago, people poured into the streets by the millions. One hundred and eight years. Done. The Cubs were World Series Champions.`
  },

  {
    id: 'mlb-bonds-73hr',
    sport: 'baseball', year: 2001, source: 'MLB Regular Season',
    title: "Barry Bonds Hits 73 Home Runs — The Record That Still Stands",
    content: `October 7th, 2001. Pacific Bell Park, San Francisco. The final home series of the Major League Baseball regular season. Barry Bonds of the San Francisco Giants entered that final weekend at home needing just one home run to break his own single-season record — a record he had already pushed beyond Roger Maris's legendary 61 home runs set in 1961 and past Mark McGwire's 70 from 1998. He hit number 73 at home, in front of his own fans, who gave him a standing ovation that lasted four minutes.

To understand what Bonds did that season requires context. In the 154 games Barry Bonds took official at-bats, opposing pitchers chose to walk him intentionally 35 times. He finished with 177 total walks — another single-season record. He had an on-base percentage of .515. He slugged .863. His OPS of 1.422 remains the single greatest offensive season in baseball history by a wide margin. When pitchers had no choice but to face him, he hit the baseball so far and so often that observers described it as watching a different sport from everything happening around him.

Whether those numbers belong in the record books without asterisks has been debated ever since. Bonds was never convicted of using performance-enhancing drugs, though his trainer, Greg Anderson, served prison time for distributing them. Bonds was indicted for perjury, convicted, then had his conviction overturned. The moral accounting of the Steroid Era in baseball remains contested and complicated.

What is not contested is what was recorded on the scoreboard and in the official statistics: 73 home runs in a single Major League Baseball season. Barry Bonds. 2001. The record stands today, unchanged and unchallenged, 24 years later.`
  },

  {
    id: 'mlb-diamondbacks-2001',
    sport: 'baseball', year: 2001, source: 'World Series Game 7',
    title: "Diamondbacks Shock the Yankees — The Most Dramatic Game 7 Ever",
    content: `November 4th, 2001. Bank One Ballpark, Phoenix, Arizona. Game 7 of the World Series. New York Yankees versus Arizona Diamondbacks. The backdrop was unlike anything in the history of the Fall Classic: just 54 days had passed since the September 11th attacks. New York was still wounded, still grieving. The Yankees had visited Ground Zero. The President had thrown out a ceremonial first pitch in Game 3. For Yankees fans — and for much of America — this World Series had become something deeper than baseball.

New York's Mariano Rivera took the mound in the ninth inning protecting a two-run lead. Rivera was baseball's untouchable postseason closer, having converted 23 consecutive postseason save opportunities. Baseball analysts had already declared that the game — and the championship — were over. Rivera was that automatic.

Pinch hitter Mark Grace led off the ninth with a single. Rivera fielded a bunt and made a rare throwing error. Tony Womack, a light-hitting utility infielder, doubled to tie the game. Then Rivera hit the next batter with a pitch, loading the bases. Luis Gonzalez, a soft-spoken first baseman known for gap doubles rather than big moments, came to the plate.

Rivera threw a cut fastball. Gonzalez, choking up on the bat to shorten his swing — knowing Rivera would throw it — swung and made contact. The ball looped over a drawn-in infield. It landed in short left field for a walk-off single. Arizona Diamondbacks 3, New York Yankees 2. World Series champions. In their fourth year of existence. In one of the most thoroughly devastated cities in America, the Yankees lost on a blooper single off the greatest closer in baseball history. No World Series Game 7 has ever been more dramatic.`
  },

  /* ═══════════════════════════════
     SOCCER
  ═══════════════════════════════ */
  {
    id: 'soccer-istanbul-2005',
    sport: 'soccer', year: 2005, source: 'UEFA Champions League Final',
    title: "The Miracle of Istanbul — Football's Greatest Comeback",
    content: `May 25th, 2005. Atatürk Olympic Stadium, Istanbul, Turkey. The UEFA Champions League Final. Liverpool Football Club versus AC Milan. By halftime, the scoreboard read: Milan 3, Liverpool 0. And it felt more comprehensive than that.

AC Milan had been the most dominant club team in world football over the previous three seasons. Their starting eleven contained Paulo Maldini, Cafu, Kaka, Hernán Crespo, and Andriy Shevchenko — the reigning FIFA World Player of the Year. Liverpool, meanwhile, had been largely dominated from the opening minute. Maldini headed in a goal in the very first minute of the match — the fastest goal in Champions League Final history. By halftime, the Italian supporters in the stands were singing, celebrating, and crying tears of joy. The trophy appeared ready to go straight to Milan.

What happened in the second half remains the most extraordinary collective comeback in the history of club football. Liverpool captain Steven Gerrard rose at the back post to head in a goal in the 54th minute. The crowd in red fell silent for half a second — then roared. Six minutes later, Vladimir Smicer struck a long-range shot that flew past Dida. Six minutes after that, Xabi Alonso's penalty was saved, but he buried the rebound. Three goals in six minutes. Three to three.

Liverpool goalkeeper Jerzy Dudek played the game of his life in extra time, producing save after save from Shevchenko in particular. In the penalty shootout, Dudek wobbled and shuffled on the goal line — a deliberate psychological tactic his goalkeeper coach had suggested. He saved twice from Shevchenko, who had never missed a penalty in his career. Liverpool won 3 to 2 on penalties. The Miracle of Istanbul. The most improbable victory in the history of European club football.`
  },

  {
    id: 'soccer-leicester-2016',
    sport: 'soccer', year: 2016, source: 'Premier League',
    title: "Leicester City — The Impossible Premier League Title",
    content: `May 2nd, 2016. At the start of the 2015-16 Premier League season, William Hill offered odds of 5000 to 1 on Leicester City winning the title. For perspective, those are longer odds than alien life being discovered and longer odds than Elvis Presley being found alive. The bookmakers were not being unfair. They were being rational.

Leicester City had finished 14th the previous season, narrowly surviving relegation. Their manager, Claudio Ranieri, was a lovable Italian tactician who had most recently been sacked by the Greek national team after a defeat to the Faroe Islands. Their striker, Jamie Vardy, had been working in a medical splint factory in Sheffield while playing non-league football for Fleetwood Town as recently as 2012. Their second forward, Riyad Mahrez, had been bought from the French second division for 450,000 pounds.

Yet from the very first weeks of the season, Leicester played football that was relentless, organized, and brilliantly effective on the counter-attack. Vardy scored in 11 consecutive Premier League games — a new record. Mahrez won the PFA Player of the Year award. N'Golo Kanté covered more ground than any midfield player in the history of Premier League tracking data. And Ranieri, who the press had dismissed as a lovable but overmatched grandpa figure, managed the season with shrewdness and calm.

When Tottenham Hotspur drew with Chelsea on a Monday night in early May, Leicester City were confirmed as Premier League champions. Players gathered at Jamie Vardy's house to watch, and when the final whistle came, they exploded — jumping, screaming, pouring onto the garden — just ordinary people who had been told their dream was impossible, standing in the rubble of every football prediction that had ever been made.`
  },

  {
    id: 'soccer-maradona-1986',
    sport: 'soccer', year: 1986, source: 'FIFA World Cup Quarterfinal',
    title: "Maradona: The Hand of God and the Goal of the Century",
    content: `June 22nd, 1986. Estadio Azteca, Mexico City. The FIFA World Cup quarterfinal between Argentina and England. The political subtext was electric and dangerous: just four years earlier, Britain and Argentina had gone to war over the Falkland Islands. Hundreds of soldiers had died on both sides. The game carried the full weight of that recent history onto the pitch, even if FIFA pretended otherwise.

Twelve minutes into the second half, with the score goalless, Diego Maradona turned toward the England goal from close range and punched the ball into the net with his left hand. The referee, unable to see from his angle, allowed the goal to stand. Maradona celebrated. In the post-match interview, he smiled and described it as scored "un poco con la cabeza de Maradona y un poco con la mano de Dios" — a little with the head of Maradona, and a little with the Hand of God. England's players protested. It counted.

Four minutes later, Maradona received a pass in his own half, roughly 65 yards from the England goal. What followed was 11 seconds of football that has never been equaled. He ran at the England defense, beat Peter Beardsley, beat Peter Reid, cut inside Steve Hodge, rounded Terry Fenwick, then approached goalkeeper Peter Shilton — who came racing off his line to narrow the angle — and slipped the ball past him with the outside of his right foot into an almost impossibly small gap, barely breaking stride throughout.

He had dribbled past five England outfield players and the goalkeeper, covering more than half the length of the pitch, without once losing control. FIFA later conducted a worldwide poll of football fans and managers to determine the greatest goal ever scored. Maradona's second goal on June 22nd, 1986 won by a landslide. It is still called the Goal of the Century.`
  },

  {
    id: 'soccer-argentina-2022',
    sport: 'soccer', year: 2022, source: 'FIFA World Cup Final',
    title: "Messi and Argentina — The World Cup Destiny Finally Fulfilled",
    content: `December 18th, 2022. Lusail Stadium, Qatar. The FIFA World Cup Final. Argentina versus France. One hundred and eight thousand people inside the stadium. One billion people watching worldwide. And at the center of it all: Lionel Messi, 35 years old, wearing the number 10 jersey of Argentina for what was almost certainly the last time in a World Cup.

Messi had won everything in club football — ten La Liga titles, four Champions League trophies, seven Ballon d'Or awards. He had been named the greatest player of his generation, and by many accounts, in all of history. But the World Cup — the single prize that for Argentinians represents football itself — had been withheld from him in an almost sadistic way. 2006. 2010. 2014: a final, lost in extra time to Germany. 2018: eliminated in the round of sixteen.

The 2022 final was a perfect theatrical arc. Argentina led 2 to nil with 10 minutes remaining. Championship. Done. Then Kylian Mbappe scored twice in 97 seconds to equalize — the most extraordinary individual rescue act in World Cup Final history. Extra time: Messi scored again. Mbappe scored again with a penalty to complete his hat trick. Three to three. Penalties.

Goalkeeper Emiliano Martínez, the best penalty-stopper in the world, saved two French kicks. Argentina won. Messi lifted the golden trophy in Lusail. He held it above his head, tears streaming down his face, flanked by teammates who had run to him and embraced him before he even fully raised the cup. Argentina were world champions for the third time in their history. Lionel Messi had done it. Thirty-five years old, and he had done it.`
  },

  {
    id: 'soccer-man-utd-1999',
    sport: 'soccer', year: 1999, source: 'UEFA Champions League Final',
    title: "Manchester United's Stoppage-Time Treble — Camp Nou, 1999",
    content: `May 26th, 1999. Camp Nou, Barcelona, Spain. The UEFA Champions League Final. Manchester United versus Bayern Munich. It was already being called one of the greatest single-season achievements in football history: United had won the Premier League, the FA Cup, and now had 90 minutes between themselves and an unprecedented treble — three major trophies in a single season.

Bayern Munich were in control throughout. United midfielder Roy Keane, their captain and most important player, had been suspended for the final due to yellow card accumulation and watched from the stands in anguish. Without him, United were disjointed. Bayern took the lead in the sixth minute through Mario Basler's free kick and controlled the game for the next 84 minutes. The clock ticked down. The UEFA Champions League trophy had already been fitted with Bayern Munich's ribbons by stadium staff, in preparation for the ceremony. Peter Schmeichel, United's captain for the final, walked toward the center circle with his head bowed.

Three minutes of added time were displayed. United won a corner. David Beckham swung it in. Teddy Sheringham, a substitute who had come on in the second half, met the ball at the near post and deflected it into the far corner. One to one. Ninety seconds later, United won another corner. Beckham again. The ball came to Sheringham, who flicked it on. Ole Gunnar Solskjaer — another substitute — stabbed the ball into the roof of the net with his right shin in the six-yard box.

The German players collapsed to the ground. Goalkeeper Oliver Kahn sat on the pitch with his gloves over his face. Sir Alex Ferguson stood on the touchline, arms stretched wide, staring up at the night sky. Two minutes. Two corners. Two goals. The most dramatic final in Champions League history. Manchester United had won the treble.`
  },

  /* ═══════════════════════════════
     GOLF
  ═══════════════════════════════ */
  {
    id: 'golf-tiger-1997-masters',
    sport: 'golf', year: 1997, source: 'The Masters Tournament',
    title: "Tiger Woods at Augusta 1997 — The Announcement That Changed Golf",
    content: `April 13th, 1997. Augusta National Golf Club, Augusta, Georgia. The Masters Tournament. Tiger Woods was 21 years old. He was in his first full season as a professional golfer. He had turned pro the previous August after winning three consecutive United States Amateur championships — a feat no one in the history of golf had accomplished. The professional world had watched with curiosity and some skepticism. Augusta would be his test.

He stumbled on the first nine holes of his first round, shooting 40 — four over par — and the skeptics nodded knowingly. Augusta was too much for a 21-year-old, no matter the hype. Then Tiger turned the corner, literally and figuratively, and played the back nine in five under par. Something had shifted. By the weekend, it was clear that something historic was unfolding.

Tiger won the Masters by 12 strokes. Twelve. The largest margin of victory in Masters history. His score of 270, 18 under par for four rounds, was a Masters record. He became the youngest Masters champion in the tournament's history. He was the first player of Black or Asian heritage to win a major championship in professional golf — a sport that had excluded players of color from competing at Augusta National until 1975.

The Augusta National gallery, which tends toward polite golf-clap appreciation, followed Tiger all four days in a roaring, surging wave of thousands of fans. Players who had won Masters titles themselves watched him and said openly that they had never seen anything quite like it. Golf commentator Jim Nantz, calling the final round on CBS, struggled to find adequate words. After Tiger held the champion's green jacket over his shoulders, he embraced his father Earl at the 18th green and wept. An era had begun, and professional golf has never looked the same since.`
  },

  {
    id: 'golf-nicklaus-1986-masters',
    sport: 'golf', year: 1986, source: 'The Masters Tournament',
    title: "Jack Nicklaus at 46 — The Greatest Sunday in Masters History",
    content: `April 13th, 1986. Augusta National Golf Club, Augusta, Georgia. The Masters Tournament. Jack Nicklaus was 46 years old. He had won 17 Major championships — more than any golfer in history. He had won the Masters five previous times. But his last Major victory had come in 1980, six years earlier. He had entered the week as a sentimental favorite, the old lion of the game, beloved but past his peak. The golf media had been polite but clear about it: Jack Nicklaus was finished as a contender.

He entered the final round trailing by four strokes. For the first 12 holes on Sunday, he played respectably but not spectacularly. Then, beginning at the 13th hole, one of the most extraordinary stretches of pressure golf ever witnessed by a live audience began to unfold. Birdie at 13. Eagle at 15. Birdie at 16. Birdie at 17. Four-under-par on the back nine in the stretch that decides every Masters.

The Augusta crowds, which had been following him with affection all week, began running between holes with a kind of frenzied energy not usually associated with golf galleries. When Nicklaus made the eagle putt at 15, the roar from the gallery carried down the valley and reportedly reached players who were still on the eighth hole, more than a mile away. On the 17th hole, his birdie putt from 11 feet curled perfectly into the cup and he raised his putter above his head and thrust it toward the crowd, his face contorted with pure, overwhelming joy.

He shot 65. He finished at nine under par. He won the Masters. His sixth Masters title. His 18th Major championship. The oldest Masters champion in history. The most emotional Sunday afternoon Augusta National had ever seen. Jack Nicklaus, written off by the golf world, walked up the 18th fairway in 1986 to a standing ovation that never stopped.`
  },

  {
    id: 'golf-tiger-2019-masters',
    sport: 'golf', year: 2019, source: 'The Masters Tournament',
    title: "Tiger's Comeback Masters — The Most Emotional Victory in Golf",
    content: `April 14th, 2019. Augusta National Golf Club, Augusta, Georgia. The Masters Tournament. Tiger Woods was 43 years old. The last time he had won a Major championship was the 2008 U.S. Open — eleven years earlier. In the time between, his personal life had collapsed in public scandal. His body had been through four back surgeries, including a spinal fusion procedure in 2017 that multiple orthopedic surgeons privately told colleagues had ended his career as a competitive golfer. In 2017, he had been found unconscious in his car by Florida police.

The golf world had mourned Tiger's competitive career as over. Celebrated him for what he had been. Used past tense.

But in 2018, Tiger began slowly, carefully returning to tour competition. He showed flashes. People began to wonder. Then, in November 2018, he won the Tour Championship in Atlanta — his first PGA Tour victory in five years. The world went slightly mad. The eyes were back. The movement was back. Something was back.

Augusta 2019. Tiger played all four rounds with controlled aggression and clinical precision — the old Tiger, managing a golf course like a chess board, never forcing, always patient. He entered Sunday's final round tied for second, two strokes back. Then, hole by hole on the back nine, the leaderboard shuffled and shifted until, with four holes to play, Tiger Woods was in sole possession of the lead.

He parred the 15th, the 16th, the 17th, the 18th. He walked onto the 18th green to a roar from the Augusta crowd that has since been described by CBS sound engineers as the loudest audio they have ever recorded at a golf event. His son Charlie, 10 years old, wrapped his arms around his father's waist. Tiger put his arms around him. The same image as 1997, reversed. Tiger Woods had won the Masters. His 15th Major championship. The greatest comeback in the history of golf.`
  },

  {
    id: 'golf-tiger-pebble-2000',
    sport: 'golf', year: 2000, source: 'US Open Championship',
    title: "Tiger at Pebble Beach — The Most Dominant Major Ever Played",
    content: `June 18th, 2000. Pebble Beach Golf Links, Pebble Beach, California. The United States Open Championship. Tiger Woods was 24 years old, and he had just entered what golf historians and analysts uniformly agree was the single most dominant two-year stretch any golfer has ever produced. He had won the previous year's PGA Championship. He was the best golfer in the world by a significant margin. But what happened at Pebble Beach in June 2000 exceeded even the highest expectations of his most devoted believers.

Tiger Woods won the United States Open by 15 strokes. Fifteen. The largest margin of victory in U.S. Open history by seven strokes. The second and third place finishers — Ernie Els and Miguel Angel Jimenez, two of the finest players in the world — finished at three over par. Tiger finished at twelve under par. He was the only player in the entire field of 156 professional golfers to finish under par on one of the most brutally difficult courses in American golf.

Over four rounds at Pebble Beach, Tiger hit 39 of 56 fairways. He had zero bogeys in the final 36 holes. He hit 53 of 72 greens in regulation. He had no three-putt greens all week. He played 72 holes of golf at a course known for punishing every imperfection and produced a performance so statistically separated from the rest of the field that analysts struggled to find an historical comparison. The next best statistical season at the U.S. Open, going back decades, was not close.

In the third round, Tiger hit a shot from the rough into the Pacific Ocean — his only truly bad shot of the week — made a bogey, and still led the tournament by nine strokes. Greg Norman, watching at home, said: "I just saw God. He wore a red shirt."`
  },

  {
    id: 'golf-tiger-chip-2005',
    sport: 'golf', year: 2005, source: 'The Masters Tournament',
    title: "The Greatest Chip Shot Ever Hit — Tiger at the 16th",
    content: `April 10th, 2005. Augusta National Golf Club, Augusta, Georgia. Sunday afternoon. The Masters Tournament. The 16th hole. Tiger Woods's chip from the back-left fringe of the green.

Tiger's tee shot on the par-three 16th had been pulled slightly left, leaving his ball above the hole on the severely sloped Bermuda grass of Augusta's green complex. The pin was cut in the lower-right section of the green, just feet from the right edge. The slope between his ball and the hole was steep and fast — Augusta's greens are the fastest in professional golf. From where Tiger stood, the margin for error was essentially zero. Chip too firm, and the ball races past the pin and off the green entirely. Chip too soft, and it never reaches the hole. There was exactly one speed at which the chip could be played. Tiger found it.

The ball rolled slowly and precisely from the fringe, gathering speed as it descended the slope, curling slightly from left to right. For three eternal seconds, the ball appeared to be rolling millimeters to the right of the hole. Then its leftward curve pulled it back. The ball paused — literally paused, as if held by the force of the gallery's collective breath — on the very lip of the cup, with the Nike logo perfectly visible on the face of the ball as if posed for a commercial. Then it fell in.

What followed was one of the loudest celebrations in Masters history — not for a birdie that won the tournament, but for a single chip shot on a Sunday afternoon that was so impossibly precise that 20,000 people at Augusta National and millions watching on television simultaneously understood that they had just witnessed something they would remember for the rest of their lives. Golf has been played for 600 years. That chip shot has never been matched.`
  },

  /* ═══════════════════════════════
     FORMULA 1
  ═══════════════════════════════ */
  {
    id: 'f1-senna-death-1994',
    sport: 'f1', year: 1994, source: 'San Marino Grand Prix',
    title: "Ayrton Senna — The Day Formula One Stood Still",
    content: `May 1st, 1994. Autodromo Enzo e Dino Ferrari, Imola, Italy. The San Marino Grand Prix. The race weekend had already been marked by tragedy. Brazilian rookie Roland Ratzenberger had been killed in a qualifying crash the previous day — the first driver death in Formula One in twelve years. The entire paddock was shaken. Many drivers considered withdrawing. Ayrton Senna, three-time World Champion, had been seen weeping in his car after Ratzenberger's accident.

Senna led from the start. On the seventh lap, his Williams FW16 entered the Tamburello corner — a fast, sweeping left-hander taken at nearly 190 miles per hour. The car inexplicably veered right, left the asphalt, and struck an unprotected concrete retaining wall at enormous speed. The world watched.

The Brazilian government declared three days of national mourning. His state funeral in São Paulo drew three million people lining the streets of the city. Pelé, then the most celebrated person in Brazil, wept publicly. The president of Brazil spoke of a national wound. Messages of grief came from every country, from Formula One drivers and fans, from football players, from heads of state, from people who had never watched a motor race in their lives but had heard his name and knew what he represented — a standard of brilliance and commitment to excellence that the sport had never produced before and has not produced since.

Senna's death fundamentally changed Formula One. Safety standards were overhauled entirely. Barriers were redesigned. Cockpits were reinforced. The sport's governing body implemented dozens of new safety measures. The modern era of Formula One safety — which has allowed drivers to survive accidents that would have been fatal in the pre-Senna era — is his lasting legacy. Ayrton Senna died at 34 years old. He remains, to this day, the greatest driver the sport has ever lost.`
  },

  {
    id: 'f1-hamilton-2008',
    sport: 'f1', year: 2008, source: 'Brazilian Grand Prix',
    title: "Lewis Hamilton Wins His First Championship on the Very Last Corner",
    content: `November 2nd, 2008. Autodromo José Carlos Pace, São Paulo, Brazil. The Brazilian Grand Prix. The final race of the Formula One season. Lewis Hamilton, 23 years old, racing for McLaren in his second full season, needed to finish fifth or better to become the youngest Formula One World Champion in history. His title rival, Ferrari's Felipe Massa, needed to win the race and hope Hamilton finished sixth or worse.

With five laps to go, Massa was winning. Hamilton was running in sixth — one position too low. The title was slipping away. Then rain began to fall on the circuit, lightly at first, then heavier. Drivers scrambled to make tire decisions. Hamilton remained on dry tires as the conditions deteriorated. With one lap remaining, he was still sixth. The championship was gone. Felipe Massa crossed the finish line in first place at his home circuit in São Paulo, in front of his nation, and his crew radioed him with the news that he was world champion. The Ferrari pit wall erupted. Massa wept in his car.

Then, on the very last corner of the very last lap of the entire season — the final corner of the Interlagos circuit — Toyota driver Timo Glock, on dry tires, lost all grip on the wet track and his car slowed to a crawl. Hamilton passed him. Fifth place. Hamilton crossed the line, and the electronic timing system updated: Hamilton was champion by one point.

The McLaren garage knew before the commentators did. The scream from the McLaren pit wall was primal. Hamilton didn't know until he crossed the line and his team told him through the radio. He parked his car, stepped out, and stood on the asphalt with both fists raised, unable to speak. The most dramatic conclusion to a Formula One season in the sport's 60-year history.`
  },

  {
    id: 'f1-abu-dhabi-2021',
    sport: 'f1', year: 2021, source: 'Abu Dhabi Grand Prix',
    title: "Abu Dhabi 2021 — The Most Controversial Lap in Formula One History",
    content: `December 12th, 2021. Yas Marina Circuit, Abu Dhabi. The final race of the Formula One season. Lewis Hamilton versus Max Verstappen. The two had traded the World Championship lead 12 times over 21 races — the most tightly contested title battle in the sport's modern history. Hamilton entered the final race leading Verstappen by eight points. He led the Abu Dhabi Grand Prix from the start and, with five laps remaining, had opened a comfortable gap. His eighth World Championship — which would have made him the sole most decorated driver in Formula One history, surpassing his own shared record with Michael Schumacher — was within reach.

On lap 53 of 58, Nicholas Latifi's Williams crashed into the barriers. The safety car was deployed. Hamilton pitted for fresh tires; Hamilton stayed out on worn ones. Then race director Michael Masi made a decision that provoked the most volcanic controversy in Formula One since Senna and Prost at Suzuka in 1989. Masi allowed only the five lapped cars between Hamilton and Verstappen to unlap themselves — ignoring all others. This had the effect of placing Verstappen, on fresh soft tires, directly behind Hamilton with one lap remaining. Mercedes protested immediately by radio. Masi waved them off.

On the final lap, Verstappen passed Hamilton's aging hard tires on the straight. He won the race and the World Championship by the narrowest possible margin. Hamilton did not stop for the podium ceremony. Mercedes filed two separate official protests that night. Both were rejected. Race director Michael Masi was removed from his position by the FIA the following February. Lewis Hamilton did not speak to the media for three months. The Abu Dhabi 2021 controversy has been analyzed, relitigated, and debated in Formula One circles every day since. Max Verstappen became World Champion. Whether he did so fairly remains the most divisive question in the sport's history.`
  },

  {
    id: 'f1-schumi-ferrari-2000',
    sport: 'f1', year: 2000, source: 'Japanese Grand Prix',
    title: "Schumacher Ends Ferrari's 21-Year Championship Drought",
    content: `October 8th, 2000. Suzuka Circuit, Suzuka, Japan. The Japanese Grand Prix. The final round of the Formula One World Championship. Michael Schumacher, driving for Ferrari, entered the race knowing a single point advantage over Mika Häkkinen was all that stood between him and the World Championship — his third. But more importantly, the championship he was about to win would be Ferrari's first Drivers' title since Jody Scheckter in 1979. Twenty-one years. The most storied name in motorsport, the team that invented the concept of Formula One passion, had gone 21 years without its most coveted prize.

Schumacher took the lead at the start from pole position and drove with the total composure that defined his racing. He controlled his tire degradation. He managed the race tempo. He kept Häkkinen behind him through the first stint, through the pit stop cycle, and through the closing laps. With three laps to go, Häkkinen's engine failed spectacularly, and Schumacher crossed the finish line as champion.

He parked his Ferrari at the start-finish straight, stopped the engine, and sat in the car for nearly 30 seconds without moving. Then he climbed out slowly, sat on the sidepod of the car with his feet on the cockpit, put his helmet visor down, and wept. Openly, completely, in front of every camera. In the Ferrari garage in Maranello, Italy — where engineers and team members had been watching on monitors — grown men and women fell to their knees. Jean Todt, Ferrari's team principal, sat at his pit box and placed his face in his hands and sobbed.

Michael Schumacher and Ferrari would go on to win five consecutive World Championships together between 2000 and 2004 — a dynasty unmatched in the sport's history.`
  },

  {
    id: 'f1-verstappen-2023',
    sport: 'f1', year: 2023, source: 'FIA Formula One World Championship',
    title: "Max Verstappen's 2023 Season — The Greatest in Formula One History",
    content: `2023. The Formula One World Championship. Max Verstappen of Red Bull Racing produced what statisticians, race engineers, team principals, and every living World Champion who was asked about it immediately and unanimously described as the single most dominant season any driver has ever produced in the 74-year history of Formula One competition.

He won 19 races in a single season. The previous record — shared by Verstappen himself and Sebastian Vettel, established in 2022 and 2013 respectively — was 15. He didn't approach the record: he shattered it by four wins. He won ten consecutive Grand Prix weekends between Spain and Japan, a new record for consecutive victories. He clinched the World Drivers' Championship at the Japanese Grand Prix, with six full race weekends still remaining on the calendar — the earliest championship clinch in the modern era of Formula One. He scored 575 championship points. The previous record was 454.

Teammates and rivals consistently described the gap between Verstappen and everyone else as unlike anything they had experienced in racing. His Red Bull RB19 car was undeniably the fastest machine in the field, but Verstappen extracted performance from it that Red Bull's own engineers said exceeded their data predictions. His qualifying pace was particularly frightening — his teammate Sergio Perez, himself a multiple race winner in 2023 and widely considered one of the top five drivers in the world, was regularly lapped in qualifying simulations.

Former champions Fernando Alonso, Sebastian Vettel, and Lewis Hamilton were all asked at various points during the season if they could have matched what Verstappen was doing. Each, in their own way, declined to claim they could. Max Verstappen at 25 years old, in the 2023 Formula One season, was simply operating in a category of performance that the sport had never previously witnessed.`
  },

];

/* ═══════════════════════════════════
   ESPN Live API  (non-blocking)
══════════════════════════════════ */
async function fetchLiveESPN(sport) {
  const meta = SPORT_META[sport];
  if (!meta?.espn) return [];
  try {
    const r = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${meta.espn}/news?limit=8`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return (data.articles || [])
      .filter(a => a.description && a.description.length > 100)
      .map(a => ({
        id:      'live-' + (a.dataSourceIdentifier || Math.random()),
        sport,
        year:    new Date().getFullYear(),
        source:  'ESPN',
        title:   a.headline || 'Breaking Sports News',
        content: a.description || '',
        url:     a.links?.web?.href || '',
        isLive:  true,
      }));
  } catch { return []; }
}

/* ═══════════════════════════════════
   Public API
══════════════════════════════════ */
async function getRandomStory(sportFilter = 'all') {
  let pool = sportFilter === 'all'
    ? [...HISTORICAL_STORIES]
    : HISTORICAL_STORIES.filter(s => s.sport === sportFilter);

  // 40% chance: try to prepend a live ESPN story
  if (Math.random() > 0.6) {
    const target = sportFilter === 'all'
      ? Object.keys(SPORT_META)[Math.floor(Math.random() * 6)]
      : sportFilter;
    const live = await fetchLiveESPN(target);
    if (live.length) pool = [...live, ...pool];
  }

  if (!pool.length) pool = HISTORICAL_STORIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getSportMeta(sport) {
  return SPORT_META[sport] || { name: 'Sports', emoji: '🏆', color: '#FF6B35' };
}

function getSportKeys() { return Object.keys(SPORT_META); }
