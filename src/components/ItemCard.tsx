import { Card, CardContent, Grid, Typography } from "@mui/material"


enum ItemCategory { COMPANY = 0, ARTIFACT, SCAVENGER }
enum ItemType { MELEE=0, GUN, ARMOR, TODO_ITEM }

interface ItemDataInterface {
    genHash: string,
    id: number,
    uifID: number,
    holdingPlayerId: number,

    weight: number,

    traitModID: number,

    itemCategory: ItemCategory,

    grantsAbility: number,
    grantsFlaw: number,

    itemType: ItemType,

    power: number,

    inGame: boolean
}

const ItemCategoryToString = new Map([
    [ItemCategory.COMPANY, "Company"],
    [ItemCategory.ARTIFACT, "Artifact"],
    [ItemCategory.SCAVENGER, "Scavenger"]
]);

const ItemTypeToString = new Map([
    [ItemType.ARMOR, "Armor"],
    [ItemType.GUN, "Gun"],
    [ItemType.MELEE, "Melee"],
    [ItemType.TODO_ITEM, "TODO TYPE"]
]);

export default function ItemCard(props: ItemDataInterface) {

    return (
        <Grid item xs={12} id={"item-card-for-" + props.genHash}>
            <Card>
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                {props.genHash}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">
                                Id: {props.id.toString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">
                                Weight: {props.weight.toString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">
                                Category: {ItemCategoryToString.get(props.itemCategory)}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">
                                Type: {ItemTypeToString.get(props.itemType)}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">
                                Power: {props.power.toString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
